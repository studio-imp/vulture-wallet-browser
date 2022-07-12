import { cryptoWaitReady } from '@polkadot/util-crypto';
import { WsProvider, Keyring, ApiPromise} from '@polkadot/api';

import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";
import { KeyringPair } from '@polkadot/keyring/types';

import { VultureNetwork, MethodResponse } from '../InetworkAPI';
import { VultureMessage } from '../../../../src/vulture_backend/vultureMessage';
import { AccountData } from '../../../../src/vulture_backend/wallets/vultureWallet';
import { SubstrateStakingInfo } from '../../../../src/vulture_backend/types/stakingInfo';
import { AbstractToken } from '../../../../src/vulture_backend/types/abstractToken';
import { erc20Abi } from './ink_contract_abis/erc20Abi';
import { erc721Abi } from './ink_contract_abis/erc721Abi';
import { getERC20Info, getERC20Balance, getERC721Info, getERC721Balance, getERC721Metadata } from './contractFunctions';

const { ContractPromise } = require('@polkadot/api-contract');
import { AccountInfoHandler } from "../InetworkAPI";
import { TokenTypes } from '../../../../src/vulture_backend/types/tokenTypes';


export class SubstrateInfo implements AccountInfoHandler {
    
    isCryptoReady: boolean = false;

    address: string = "";
    derivationPath: string;

    networkURI: string;
    wsProvider?: WsProvider;
    networkAPI?: ApiPromise;

    addedTokens: AbstractToken[] = [];
    addedNFTs: AbstractToken[] = [];

    constructor(address: string, derivationPath: string, networkURI: string) {
        this.networkURI = networkURI;
        this.address = address;
        this.derivationPath = derivationPath;
        this.isCryptoReady = true;

        
        cryptoWaitReady().then((ready) => {
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
    async getStakingInfo(address: string, stakingAddress: string) {
        if(this.isCryptoReady) {
            let stakingInfo: SubstrateStakingInfo = {
                stakingAddress: '',
                controllerAddress: '',
                isStashAccountBonded: false,
                frozenBalance: '',
                stakedBalance: '',
                unlocking: [],
                currentEra: ''
            };
            let success: boolean = true;

            // Get the current Era.
            this.networkAPI?.query.staking.currentEra().then((data) => {
                if(data.toHuman() != null) {
                    stakingInfo.currentEra = data.toHuman() as string;
                }else {
                    console.error("Failed to get era!");
                    success = false;
                }
            });

            // Check if the controller account is bonding the stash account.
            this.networkAPI?.query.staking.bonded(stakingAddress).then((data) => {
                if(data.toHuman() == null) {
                    stakingInfo.isStashAccountBonded = false;
                }else if (data.toHuman() == stakingAddress) {
                    stakingInfo.isStashAccountBonded = true;
                }else {
                    success = false;
                    console.error("Staking account is bonded to an incorrect controller address!");
                }
            });

            // Get the staking information for the stakingAddress, by the controller address.
            this.networkAPI?.query.staking.ledger(address).then((data) => {
                console.log(data.toJSON());
                if(data.toJSON() == null) {
                    stakingInfo.stakedBalance = '0';
                }
                /*                
                if(data.toJSON()) {
                    stakingInfo.isStashAccountBonded = false;
                }else if (data.toHuman() == stakingAddress) {
                    stakingInfo.isStashAccountBonded = true;
                }else {
                    success = false;
                    console.error("Failed getting staking information!");
                }
                */
            });

            console.log(stakingInfo);


            if(success == true) {
                postMessage({method: VultureMessage.GET_BALANCE_OF_ADDRESS, params: {
                    success: true,
                    stakingInfo: stakingInfo,
                }});
            }else {
                postMessage({method: VultureMessage.GET_BALANCE_OF_ADDRESS, params: {
                    success: false,
                }});
            }

        }else {
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async getTokenMetadata(tokenAddress: string, tokenType: TokenTypes, tokenId?: number){
        switch(tokenType) {
            case TokenTypes.ERC721: {
                let erc721contract = new ContractPromise(this.networkAPI!, erc721Abi, tokenAddress);
                await getERC721Metadata(tokenAddress, erc721contract, this.address, tokenId!);
                break;
            }
            default: {
                console.log("Token Type: " + tokenType + " doesn't contain a metadata method! (At least one that is supported by vulture)");
                break;
            }
        }
    }
    async validateAddress(address: string) {
        if(this.isCryptoReady) {
            let result = false;
            try {
                encodeAddress(
                    isHex(address)
                        ? hexToU8a(address)
                        : decodeAddress(address)
                );
                result = true;
            }catch(error) {
                result = false;
            }
            postMessage({method: VultureMessage.IS_ADDRESS_VALID, params: {
                success: true,
                isValid: result,
            }});
        }else {
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async setAddress(address: string) {
        throw new Error('Method not implemented.');
    }
    async subscribeToAddressEvents() {
        if(this.isCryptoReady) {

            const unsub = await this.networkAPI?.query.system.account(this.address, async (result: any) => {
                postMessage({method: VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, params: {
                    success: true,
                    result: result.toJSON(),
                }});
            });

        }else {
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async getBalanceOfToken(tokenAddress: string, tokenType: string) {
        if(this.isCryptoReady) {
            switch(tokenType) {
                case 'ERC20': {
                    let erc20contract = new ContractPromise(this.networkAPI!, erc20Abi, tokenAddress);
                    await getERC20Balance(tokenAddress, erc20contract, this.address);
                    break;
                }
                case 'ERC721': {
                    let erc721contract = new ContractPromise(this.networkAPI!, erc721Abi, tokenAddress);
                    await getERC721Balance(tokenAddress, erc721contract, this.address);
                    break;
                }
                default: {
                    console.error("Tried getting balance of token, but the tokenType is invalid!");
                    postMessage({method: VultureMessage.GET_TOKEN_BALANCE, params: {
                        success: false,
                    }});
                }
            }
        }else {
            postMessage({method: VultureMessage.GET_TOKEN_BALANCE, params: {
                success: false,
            }});
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async addTokenToSubscription(tokenAddress: string, tokenType: string) {
        if(this.isCryptoReady) {
            switch(tokenType) {
                case 'ERC20': {

                    // This doesn't work for some reason... Fix!
                    //const unsub = await this.networkAPI?.query.contracts.contractInfoOf(tokenAddress, async (result: any) => {
                    //    await getERC20Balance(tokenAddress, erc20contract, this.address);
                    //});

                    // Due to the fact that contract subscriptions aren't available yet, this is a temporary work-around.
                    // Will poll the balance ever 2.5 seconds.
                    setInterval(async () => {
                        let erc20contract = new ContractPromise(this.networkAPI!, erc20Abi, tokenAddress);
                        await getERC20Balance(tokenAddress, erc20contract, this.address);
                    }, 2500);
                    break;
                }
                case 'ERC721': {
                    setInterval(async () => {
                        let erc721contract = new ContractPromise(this.networkAPI!, erc721Abi, tokenAddress);
                        await getERC721Balance(tokenAddress, erc721contract, this.address);
                    }, 2500);
                    break;
                }
                default: {
                    console.error("Tried getting balance of token, but the tokenType is invalid!");
                    postMessage({method: VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, params: {
                        success: false,
                    }});
                }
            }
        }else {
            postMessage({method: VultureMessage.GET_TOKEN_BALANCE, params: {
                success: false,
            }});
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async getTokenData(tokenAddress: string, tokenType: string) {
        if(this.isCryptoReady) {
            try {
                switch(tokenType) {
                    case 'ERC20': {
                        let erc20Contract = new ContractPromise(this.networkAPI!, erc20Abi, tokenAddress);
                        await getERC20Info(tokenAddress, erc20Contract, this.address);
                        break;
                    }
                    case 'ERC721': {
                        let erc721Contract = new ContractPromise(this.networkAPI!, erc721Abi, tokenAddress);
                        await getERC721Info(tokenAddress, erc721Contract, this.address);
                        break;
                    }
                    default: {
                        console.error("TokenType: " + tokenType + " is invalid for this method!");
                    }
                }
            }catch(error) {
                console.log(error);
                postMessage(new MethodResponse(
                    VultureMessage.GET_TOKEN_DATA,
                    {
                        tokenData: null,
                        error: "Contract Not Found",
                        success: false,
                    }
                ));
            }
        }
    }
    async getBalanceOf(address: string) {
        if(this.isCryptoReady) {

            this.networkAPI?.query.system.account(address).then((data) => {
                postMessage({method: VultureMessage.GET_BALANCE_OF_ADDRESS, params: {
                    success: true,
                    data: data.toJSON(),
                    address: address,
                }});
            });

        }else {
            postMessage({method: VultureMessage.GET_BALANCE_OF_ADDRESS, params: {
                success: false,
                address: address,
            }});
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
}