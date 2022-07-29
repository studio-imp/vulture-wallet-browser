import { cryptoWaitReady } from '@polkadot/util-crypto';

import { WsProvider, Keyring, ApiPromise} from '@polkadot/api';

import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";
import { KeyringPair } from '@polkadot/keyring/types';

import { VultureNetwork, MethodResponse } from '../InetworkAPI';
import { VultureMessage } from '../../../../src/vulture_backend/vultureMessage';
import { AccountData } from '../../../../src/vulture_backend/wallets/vultureWallet';
import { AbstractToken } from '../../../../src/vulture_backend/types/abstractToken';
import { erc20Abi } from './ink_contract_abis/erc20Abi';
import { getERC20Info, getERC20Balance } from './contractFunctions';

const { ContractPromise } = require('@polkadot/api-contract');
import { AccountActionHandler } from "../InetworkAPI";
import { Network } from '../../../../src/vulture_backend/types/networks/networkTypes';
import { SubstrateBondData } from '../../../../src/vulture_backend/types/stakingInfo';
import BigNumber from 'bignumber.js';


export class SubstrateInitData {
    seedPhrase: string;
    derivationPath: string;
    wsNetworkURI: string;
    ss58Format: string;
    keyringType: string;

    constructor(seed: string, derivationPath: string, websocketNetworkURI: string, addressFormat: string, keyringType: string) {
        this.derivationPath = derivationPath;
        this.wsNetworkURI = websocketNetworkURI;
        this.ss58Format = addressFormat;
        this.seedPhrase = seed;
        this.keyringType = keyringType;
    }
}

export class SubstrateActions implements AccountActionHandler {
    
    isCryptoWasmReady: boolean = false;

    address: string = "";
    ss58Format?: string;

    networkURI: string;

    seed: string;
    derivationPath: string;
    keyringType: string;

    keyring?: Keyring;
    keypair?: KeyringPair;

    wsProvider?: WsProvider;
    networkAPI?: ApiPromise;

    constructor(initData: SubstrateInitData) {
        this.networkURI = initData.wsNetworkURI;
        this.seed = initData.seedPhrase;
        this.ss58Format = initData.ss58Format;
        this.keyringType = initData.keyringType;
        this.derivationPath = initData.derivationPath;
        cryptoWaitReady().then((ready) => {
            console.log("Cryptography Web-Assembly status: " + ready);
            this.isCryptoWasmReady = ready;

            this.keyring = new Keyring({
                type: this.keyringType == "sr25519" ? 'sr25519' : 'sr25519',
                ss58Format: Number(this.ss58Format),
            });
            this.keypair = this.keyring.addFromUri(this.seed + this.derivationPath);
            this.address = this.keypair.address;

            this.wsProvider = new WsProvider(this.networkURI);
            this.wsProvider.isReady.then(() => {
                ApiPromise.create({provider: this.wsProvider}).then((api) => {
                    this.networkAPI = api;
                    postMessage(new MethodResponse(
                        VultureMessage.SET_CURRENT_WALLET,
                        {
                            success: true,
                            address: this.address
                        }
                    ));
                });
            });
        }).catch((error) => {
            console.error(error);
            postMessage(new MethodResponse(
                VultureMessage.SET_CURRENT_WALLET,
                {
                    success: false,
                    error: error,
                }
            ));
        });
    }
    async nominateValidator(nominee: string) {
        if(this.isCryptoWasmReady) {

            this.networkAPI?.tx.staking.nominate([{Id: nominee}]).signAndSend(this.keypair!, ({events = [], status}) => {
                if(status.isInBlock) {
                    events.forEach(({event: {data, method, section}, phase}) => {
                        if(method == 'ExtrinsicSuccess') {
                          postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                              success: true,
                              status: status.type,
                              blockHash: status.asInBlock.toHex(),
                              method: method,
                          }});
                        } else if(method == 'ExtrinsicFailed') {
                          postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                              success: false,
                              status: status.type,
                              blockHash: status.asInBlock.toHex(),
                              method: method,
                          }});
                        }
                    });
                }else if(status.isDropped) {
                  postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                      success: false,
                      status: status.type,
                  }});
                }else if(status.isFinalityTimeout) {
                  postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                      success: false,
                      status: status.type,
                  }});
                }else if(status.isInvalid) {
                  postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                      success: false,
                      status: status.type,
                  }});
                }
            }).catch((error) => {
                console.error(error);
                postMessage({method: VultureMessage.NOMINATE_VALIDATOR, params: {
                    success: false,
                }});
            });

        }else {
            console.error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async stakeFunds(bondData: SubstrateBondData) {
        if(this.isCryptoWasmReady) {
            let kp = this.keyring?.addFromUri(this.seed + bondData.stakingAddressDerivationPath);
            if(kp == undefined) {
                console.error("No signature keypair could be generated for staking address!");
                return;
            }

            let stakedBalance: BigNumber;
            let minBond: BigNumber;

            let minNominationAmount = await this.networkAPI?.query.staking.minNominatorBond();
            if(minNominationAmount != undefined) {
                minBond = new BigNumber((minNominationAmount.toHuman() as string).replaceAll(',', ''));
            }else {
                postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                    success: false,
                }});
                console.error("Failed getting minimum bond amount! This is dangerous.");
                return;
            }

            // Get the staking information for the stakingAddress, by the controller address.
            let ledger = await this.networkAPI?.query.staking.ledger(bondData.controllerAddress);
            if(ledger != undefined) {
                if(ledger.toJSON() == null) {
                    stakedBalance = new BigNumber(0);
                }else {
                    stakedBalance = new BigNumber((ledger.toJSON() as any).active);

                }
            }else {
                stakedBalance = new BigNumber(0);
            }

            // We are already bonded, we will add extra bond
            if(stakedBalance.comparedTo(minBond) == 1 || stakedBalance.comparedTo(minBond) == 0) {
                this.networkAPI?.tx.staking.bondExtra(bondData.bondAmountWhole).signAndSend(kp!, ({events = [], status}) => {
                    if(status.isInBlock) {
                        events.forEach(({event: {data, method, section}, phase}) => {
                            if(method == 'ExtrinsicSuccess') {
                              postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                                  success: true,
                                  status: status.type,
                                  blockHash: status.asInBlock.toHex(),
                                  method: method,
                              }});
                            } else if(method == 'ExtrinsicFailed') {
                              postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                                  success: false,
                                  status: status.type,
                                  blockHash: status.asInBlock.toHex(),
                                  method: method,
                              }});
                            }
                        });
                    }else if(status.isDropped) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }else if(status.isFinalityTimeout) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }else if(status.isInvalid) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }
                }).catch((error) => {
                    console.error(error);
                    postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                        success: false,
                    }});
                });;

            }else {
                // We are not bonded, we will bond for the first time.
                this.networkAPI?.tx.staking.bond(bondData.controllerAddress, bondData.bondAmountWhole, 'Staked').signAndSend(kp!, ({events = [], status}) => {
                    if(status.isInBlock) {
    
                        events.forEach(({event: {data, method, section}, phase}) => {
                            if(method == 'ExtrinsicSuccess') {
                              postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                                  success: true,
                                  status: status.type,
                                  blockHash: status.asInBlock.toHex(),
                                  method: method,
                              }});
                            } else if(method == 'ExtrinsicFailed') {
                              postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                                  success: false,
                                  status: status.type,
                                  blockHash: status.asInBlock.toHex(),
                                  method: method,
                              }});
                            }
                        });
                    }else if(status.isDropped) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }else if(status.isFinalityTimeout) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }else if(status.isInvalid) {
                      postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                          success: false,
                          status: status.type,
                      }});
                    }
                }).catch((error) => {
                    console.error(error);
                    postMessage({method: VultureMessage.STAKE_FUNDS, params: {
                        success: false,
                    }});
                });;
            }
            
        }else {
            console.error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async generateAddress(derivationPath: string, accountIndex?: number) {
        if(this.isCryptoWasmReady){
            let kp = this.keyring!.addFromUri(this.seed + derivationPath);
            postMessage(new MethodResponse(
                VultureMessage.GET_ADDRESS_FROM_URI,
                {
                    success: true,
                    address: kp.address,
                    addressURI: derivationPath,
                    accountIndex: accountIndex,
                }
            ));
        }else{
            console.error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async getAddress() {
        throw new Error('Method not implemented.');
    }
    async estimateTxFee(recipent: string, amount: string, token?: AbstractToken) {
        if(this.isCryptoWasmReady) {
            
            if(token != null) {
                let contract = new ContractPromise(this.networkAPI!, erc20Abi, token.address);
                contract.tx.transfer({value: 0, gasLimit: -1}, recipent, amount).paymentInfo(this.keypair!).then((info: any) => {
                    postMessage({method: VultureMessage.ESTIMATE_TX_FEE, params: {
                        success: true,
                        result: info.toJSON(),
                        fee: info.partialFee.toHuman()
                    }});
                });
            }else {
                this.networkAPI!.tx.balances.transferKeepAlive(recipent, amount).paymentInfo(this.keypair!).then((info: any) => {
                    postMessage({method: VultureMessage.ESTIMATE_TX_FEE, params: {
                        success: true,
                        result: info.toJSON(),
                        fee: info.partialFee.toHuman()
                    }});
                });
            }

        }else {
            console.error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async updateAccountsToNetwork(accounts: AccountData[], network: Network) {
        if(this.isCryptoWasmReady) {
            let updatedAccounts: AccountData[];
            updatedAccounts = accounts;
            for(let i = 0; i < accounts.length; i++) {
                if(network.addressFormat != undefined) {
                    this.keyring!.setSS58Format(Number(network.addressFormat));
                }else {
                    this.keyring!.setSS58Format(42);
                }
                let kp = this.keyring!.addFromUri(this.seed + "//" + updatedAccounts[i].accountIndex);
                updatedAccounts[i].address = kp.address;
            }
            postMessage(new MethodResponse(
                VultureMessage.UPDATE_ACCOUNTS_TO_NETWORK,
                {
                    success: true,
                    updatedAccounts: updatedAccounts,
                }
            ));
        }
    }
    async transferAssets(recipent: string, amount: string, token?: AbstractToken, from?: {address: string, derivationPath: string}) {
        if(this.isCryptoWasmReady) {
            
            // If we are transfering from a specific address that ISN'T the main address of the current account, we will create it
            // here on the spot. This is mainly used for when single vulture accounts have multiple addresses (such as staking addresses + deposit addresses.)
            let kp = null;
            if(from != null) {
              kp = this.keyring!.addFromUri(this.seed + from.derivationPath);
            }

            if(token != null) {
              //If the method caller specified a token, we are sending the token and not the native asset.
              //This only works on substrate networks with the Ink! smart contract pallete.
  
              let contract = new ContractPromise(this.networkAPI!, erc20Abi, token.address);
              
              contract.tx.transfer({value: 0, gasLimit: -1}, recipent, amount).signAndSend(kp == null ? this.keypair! : kp, ({events = [], status = {}}) => {
                if((status as any).isInBlock) {
  
                    events.forEach(({event: {data, method, section}, phase}) => {
                        if(method == 'ExtrinsicSuccess') {
  

                          postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                              success: true,
                              status: (status as any).type,
                              blockHash: (status as any).asInBlock.toHex(),
                              method: method,
                          }});
                        } else if(method == 'ExtrinsicFailed') {                            
                          postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                              success: false,
                              status: (status as any).type,
                              blockHash: (status as any).asInBlock.toHex(),
                              method: method,
                          }});
                        }
                    });
                }else if((status as any).isDropped) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: (status as any).type,
                    }});
                  }else if((status as any).isFinalityTimeout) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: (status as any).type,
                    }});
                  }else if((status as any).isInvalid) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: (status as any).type,
                    }});
                  }
  
              });
  
            }else {
              //If the method caller hasn't specified a token, we are sending the native asset of the current network.
              this.networkAPI!.tx.balances.transferKeepAlive(recipent, amount).signAndSend(kp == null ? this.keypair! : kp, ({events = [], status}) => {
                  if(status.isInBlock) {
  
                      events.forEach(({event: {data, method, section}, phase}) => {
                          if(method == 'ExtrinsicSuccess') {
                            postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                                success: true,
                                status: status.type,
                                blockHash: status.asInBlock.toHex(),
                                method: method,
                            }});
                          } else if(method == 'ExtrinsicFailed') {                            
                            postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                                success: false,
                                status: status.type,
                                blockHash: status.asInBlock.toHex(),
                                method: method,
                            }});
                          }
                      });
                  }else if(status.isDropped) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: status.type,
                    }});
                  }else if(status.isFinalityTimeout) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: status.type,
                    }});
                  }else if(status.isInvalid) {
                    postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                        success: false,
                        status: status.type,
                    }});
                  }
              });
            }
          }else {
              postMessage({method: VultureMessage.TRANSFER_ASSETS, params: {
                  success: false,
              }});
              console.error("Cryptography WASM hasn't been initialized yet!");
          }
    }
}