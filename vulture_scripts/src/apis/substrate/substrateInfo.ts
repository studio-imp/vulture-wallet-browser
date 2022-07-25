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
import BigNumber from 'bignumber.js';


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
    async getValidatorInfo() {
        if(this.isCryptoReady) {
            let success: boolean = true;

            // K-V Store between a validator address, and it's corresponding data.
            // Looks wonky, I might create an type for this in the future.
            let validatorInfo: Map<String, {
                comission: string,
                identity: {
                    name?: string,
                    webURI?: string,
                    twitter?: string,
                    email?: string, 
                }
            }> = new Map<String, {
                comission: string,
                identity: {
                    name?: string,
                    webURI?: string,
                    twitter?: string,
                    email?: string, 
                }
            }>();

            let validators = await this.networkAPI?.query.session.validators();
            if(validators != undefined && validators.toJSON() != null) {
                let currentValidators: string[] = (validators.toJSON() as string[]);
                // Get the current era.
                let era = await this.networkAPI?.query.staking.currentEra();

                let currentEra: string | undefined = undefined;
                if(era != undefined && era.toHuman() != null) {
                    currentEra = (era.toHuman() as string);
                }else {
                    console.error("Failed to get era!");
                    success = false;
                }
                if(currentEra != undefined) {
                    // For each validator, get relevant info and instert it into the validatorInfo map.
                    for(let i = 0; i < currentValidators.length; i++) {

                        // Get validator preferences (basically just the commission).
                        let validatorComission: string = '0';
                        let validatorPrefs = await this.networkAPI?.query.staking.erasValidatorPrefs(currentEra, currentValidators[i]);
                        if(validatorPrefs != undefined && validatorPrefs.toJSON() != null) {
                            validatorComission = String((validatorPrefs.toJSON() as any).commission);
                        }else {
                            console.error("Failed to get validator info for: " + currentValidators[i]);
                        }

                        // Get validator identity (in the case that it has one).
                        let identity: {
                            name?: string,
                            email?: string,
                            webURI?: string,
                            twitter?: string,
                        } = {
                            name: undefined,
                            email: undefined,
                            webURI: undefined,
                            twitter: undefined,
                        };
                        let validatorIdentity = await this.networkAPI?.query.identity.identityOf(currentValidators[i]);
                        if(validatorIdentity != undefined && validatorIdentity.toJSON() != null) {
                            let res = (validatorIdentity.toHuman() as any);
                            identity.twitter = res.info.twitter.Raw == null ? undefined : res.info.twitter.Raw;
                            identity.name = res.info.display.Raw == null ? undefined : res.info.display.Raw;
                            identity.email = res.info.email.Raw == null ? undefined : res.info.email.Raw;
                            identity.webURI = res.info.web.Raw == null ? undefined : res.info.web.Raw;
                        }

                        validatorInfo.set(currentValidators[i], {
                            comission: validatorComission,
                            identity: identity,
                        });
                    }
                }
            }else {
                success = false;
            }

            if(success == true) {
                postMessage({method: VultureMessage.GET_VALIDATOR_LIST, params: {
                    success: true,
                    validatorInfo: validatorInfo,
                }});
            }else {
                postMessage({method: VultureMessage.GET_VALIDATOR_LIST, params: {
                    success: false,
                }});
            }

        }else {
            throw new Error("Cryptography WASM hasn't been initialized yet!");
        }
    }
    async getStakingInfo(address: string, stakingAddress: string) {
        if(this.isCryptoReady) {
            let stakingInfo: SubstrateStakingInfo = {
                stakingAddress: stakingAddress,
                controllerAddress: address,
                isStashAccountBonded: false,
                frozenBalance: '',
                stakedBalance: '',
                liquidBalance: '',
                unlocking: [],
                currentEra: '',
                minimumBondAmount: ''
            };
            let success: boolean = true;


            let era = await this.networkAPI?.query.staking.currentEra();
            if(era != undefined && era.toHuman() != null) {
                stakingInfo.currentEra = era.toHuman() as string;
            }else {
                console.error("Failed to get era!");
                success = false;
            }

            let bonded = await this.networkAPI?.query.staking.bonded(stakingAddress);
            if(bonded != undefined && bonded.toHuman() == null) {
                stakingInfo.isStashAccountBonded = false;
            }else if (bonded != undefined && bonded.toHuman() == address) {
                stakingInfo.isStashAccountBonded = true;
            }else {
                success = false;
                console.error("Staking account is bonded to an incorrect controller address!");
            }

            let minNominationAmount = await this.networkAPI?.query.staking.minNominatorBond();
            if(minNominationAmount != undefined) {
                stakingInfo.minimumBondAmount = (minNominationAmount.toHuman() as string);
            }else {
                success = false;
                console.error("Failed getting minimum bond amount! This is dangerous.");
            }

            // Get the staking information for the stakingAddress, by the controller address.
            this.networkAPI?.query.staking.ledger(address).then((data) => {
                if(data.toJSON() == null) {
                    stakingInfo.stakedBalance = '0';
                }else {
                    stakingInfo.stakedBalance = (data.toJSON() as any).active;
                }
            });


            let account = await this.networkAPI?.query.system.account(stakingAddress);
            if(account != undefined) {

                let free = new BigNumber((account.toJSON() as any).data.free);

                let feeFrozen = new BigNumber((account.toJSON() as any).data.feeFrozen);
                let miscFrozen = new BigNumber((account.toJSON() as any).data.miscFrozen);

                let liquidAmount = free.minus(BigNumber.max(feeFrozen, miscFrozen));

                stakingInfo.frozenBalance = BigNumber.max(feeFrozen, miscFrozen).toString();
                stakingInfo.liquidBalance = liquidAmount.toString();

            }else {
                console.error("Failed getting info for account!");
            }

            if(success == true) {
                postMessage({method: VultureMessage.GET_STAKING_INFO, params: {
                    success: true,
                    stakingInfo: stakingInfo,
                }});
            }else {
                postMessage({method: VultureMessage.GET_STAKING_INFO, params: {
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
    async subscribeToAddressEvents(address?: string) {
        if(this.isCryptoReady) {

            const unsub = await this.networkAPI?.query.system.account(address == null ? this.address : address, async (result: any) => {
                postMessage({method: VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, params: {
                    success: true,
                    result: result.toJSON(),
                    address: address == null ? null : address,
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