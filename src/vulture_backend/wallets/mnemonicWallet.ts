import { WalletType, VultureAccount, AccountData } from "./vultureWallet";
import SafeEventEmitter from "@metamask/safe-event-emitter";

//import { KeyringPair } from "@polkadot/keyring/types";
//import { cryptoWaitReady } from '@polkadot/util-crypto';

import { BigNumber } from "bignumber.js";
import { VultureMessage } from "../vultureMessage";
import { AbstractToken } from "../types/abstractToken";
import { SubstrateInitData } from "../../../vulture_scripts/src/apis/substrate/substrateActions";
import { Network, NetworkFeatures } from "../types/networks/networkTypes";
import { StakingInfo, SubstrateBondData, SubstrateStakingInfo } from "../types/stakingInfo";



export class MnemonicWallet implements VultureAccount {

    public actionWorker;
    public infoWorker;

    public accountEvents = new SafeEventEmitter();
    public accountData: AccountData;
    public currentNetwork: Network;
    public updateTokenBalance: any;
    public isReady: boolean = false;

    constructor(seedPhrase: string, accountData: AccountData, network: Network) {
        this.accountEvents.setMaxListeners(50);
        this.accountData = accountData;
        this.currentNetwork = network;

        // Create the two wallet back-end workers. These handle most of the hard work.
        this.actionWorker = new Worker('accountActionWorker-bundle.js', {
            type: 'module',
            credentials: 'same-origin'
        });
        this.infoWorker = new Worker('accountInfoWorker-bundle.js', {
            type: 'module',
            credentials: "same-origin"
        });

        this.accountData.stakingInfo = new Map<StakingInfo, any>();

        // Callback for SET_CURRENT_WALLET from the action worker.
        this.actionWorker.onmessage = async (event) => {

            if(event.data.method == VultureMessage.SET_CURRENT_WALLET) {
                if(event.data.params.success == true) {
                    this.accountData.address = event.data.params.address;

                    // Emit ready events when the worker is ready.
                    this.accountEvents.emit('actionWorkerReady');

                    // Initialize the AccountInfoWorker, which is a query/info focused keyless worker.
                    this.infoWorker.postMessage({
                        method: VultureMessage.SET_CURRENT_WALLET,
                        params: {
                            address: this.accountData.address,
                            derivationPath: this.accountData.derivationPath,
                            networkURI: this.currentNetwork.networkUri,
                            networkType: this.currentNetwork.networkType
                        },
                    });
                }
            }
        }
        // Callback for SET_CURRENT_WALLET from the info worker.
        this.infoWorker.onmessage = async (event) => {
            if(event.data.method == VultureMessage.SET_CURRENT_WALLET) {
                if(event.data.params.success == true) {
                    console.info("Information worker initialized.");

                    this.isReady = true;

                    // Emit ready events when the worker is ready.
                    this.accountEvents.emit('infoWorkerReady');

                    // Subscribe to account events after our info worker is initialized.
                    await this.subscribeToAccountEvents();

                    // If the current network supports staking, we initialize staking address and info.
                    if(network.networkFeatures & NetworkFeatures.STAKING) {
                        this.actionWorker.onmessage = async (event: any) => {
                            if(event.data.method == VultureMessage.GET_ADDRESS_FROM_URI) {
                                if(event.data.params.success == true && event.data.params.addressURI == "//staking_" + this.accountData.accountIndex) {
                                    let stakingInfo: SubstrateStakingInfo = {
                                        stakingAddress: event.data.params.address,
                                        controllerAddress: this.accountData.address,
                                        isStashAccountBonded: false,
                                        frozenBalance: "",
                                        stakedBalance: "",
                                        liquidBalance: "",
                                        unlocking: [],
                                        currentEra: "",
                                        minimumBondAmount: ""
                                    };
                                    this.accountData.stakingAddress = event.data.params.address;
                                    this.accountData.stakingInfo.set(StakingInfo.Substrate, stakingInfo);
                                    await this.subscribeToStakingEvents();
                                }
                            }
                        };
            
                        this.actionWorker.postMessage({
                            method: VultureMessage.GET_ADDRESS_FROM_URI,
                            params: {
                                addressURI: "//staking_" + this.accountData.accountIndex,
                                //accountIndex: accountIndex
                            }
                        });
                    }

                    // This is quite temporary.
                    /*
                    this.updateTokenBalance = setInterval(async () => {
                        this.accountEvents.emit(VultureMessage.GET_TOKEN_BALANCE);
                    }, 3000);
                    */
                }else {
                    console.error("Failed to initialize infoWorker: " + event.data.params.error);
                }
            }
        }


        // Call SET_CURRENT_WALLET for the actionWorker (this worker has the capability of signing txs).
        this.actionWorker.postMessage({
            method: VultureMessage.SET_CURRENT_WALLET,
            params: {
                initData: new SubstrateInitData(
                    seedPhrase,
                    this.accountData.derivationPath,
                    this.currentNetwork.networkUri,
                    this.currentNetwork.addressFormat == null ? "42" : this.currentNetwork.addressFormat,
                    "sr25519"
                ),
                networkType: this.currentNetwork.networkType
            } 
        });
    }
    async terminateWallet() {
        this.actionWorker.terminate();
        this.infoWorker.terminate();
        clearInterval(this.updateTokenBalance);
    }
    async bond(stakingData: SubstrateBondData) {
        // The event callback from the worker, containing the Transaction info.
        this.actionWorker.onmessage = (event) => {
            if(event.data.method == VultureMessage.STAKE_FUNDS) {
                // Emit the transation info data to accountEvents, so the front-end can use it!
                this.accountEvents.emit(VultureMessage.STAKE_FUNDS, event.data.params);
            }
        };
        // Posting a tx request to the worker.
        this.actionWorker.postMessage({
            method: VultureMessage.STAKE_FUNDS,
            params: {
                bondData: stakingData,
            }
        });
    }
    async transferAssets(destination: String, amountWhole: number, token?: AbstractToken, from?: {address: string, derivationPath: string}) {
        // The event callback from the worker, containing the Transaction info.
        this.actionWorker.onmessage = (event) => {
            if(event.data.method == VultureMessage.TRANSFER_ASSETS) {
                // Emit the transation info data to accountEvents, so the front-end can use it!
                this.accountEvents.emit(VultureMessage.TRANSFER_ASSETS, event.data.params);
                this.accountEvents.emit(VultureMessage.GET_TOKEN_BALANCE);
            }
        };
        // Posting a tx request to the worker.
        this.actionWorker.postMessage({
            method: VultureMessage.TRANSFER_ASSETS,
            params: {
                recipent: destination,
                amount: new BigNumber(amountWhole).times(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)).toString(),
                token: token == null ? null : JSON.parse(JSON.stringify(token)),
                from: from == null ? null : from
            }
        });
    }
    async getTokenInformation(tokenAddress: string, tokenType: string) {
        this.infoWorker.onmessage = (event) => {
            if(event.data.method == VultureMessage.GET_TOKEN_DATA) {
                this.accountEvents.emit(VultureMessage.GET_TOKEN_DATA, event.data);
                if(event.data.params.success == false) {
                    console.error("Error: Vulture failed to get information about token with address:\n '" + tokenAddress + "'.");
                }
            }
        }
        this.infoWorker.postMessage({
            method: VultureMessage.GET_TOKEN_DATA,
            params: {
                tokenAddress: tokenAddress,
                tokenType: tokenType,
            } 
        });
    }
    /** ## estimateTxFee()
     * This function will request an estimate transaction fee for the given transaction parameters.
     * The fee data will be sent as an event to `accountEvents` with the `VultureMessage` 'ESTIMATE_TX_FEE'.
     */
    async estimateTxFee(destination: string, amountWhole: number, token?: AbstractToken): Promise<any> {
        let actionWorker = this.actionWorker;
        let currentNetwork = this.currentNetwork;
        return new Promise(function(resolve, reject) {
            actionWorker.onmessage = (event: any) => {
                if(event.data.method == VultureMessage.ESTIMATE_TX_FEE) {
                    if(event.data.params.success == true) {
                        let fee = new BigNumber(event.data.params.result.partialFee)
                        .div(new BigNumber(10).pow(token == null ? currentNetwork.networkAssetDecimals : token.decimals)).toNumber();
                        resolve(fee);
                        
                    }else {
                        console.error("Error: Vulture worker failed to get wallet state!");
                        reject();
                    }
                }
            };

            actionWorker.postMessage({
                method: VultureMessage.ESTIMATE_TX_FEE,
                params: {
                    recipent: destination,
                    amount: new BigNumber(amountWhole).times(new BigNumber(10).pow(token == null ? currentNetwork.networkAssetDecimals : token.decimals)).toString(),
                    token: token == null ? null : JSON.parse(JSON.stringify(token)) // Due to the fact that the token is a proxy, need to stringify/parse. Temp solution.
                }
            });
        });
        
    }
    async isAddressValid(address: string) {
        this.infoWorker.onmessage = async (event) => {
            if(event.data.method == VultureMessage.IS_ADDRESS_VALID) {
                if(event.data.params.success == true) {
                    this.accountEvents.emit(VultureMessage.IS_ADDRESS_VALID, event.data.params.isValid);
                }else {
                    console.error("Error: Vulture worker failed to get wallet state!");
                }
            }
        };
        this.infoWorker.postMessage({
            method: VultureMessage.IS_ADDRESS_VALID,
            params: {
                address: address,
            }
        });
    }

    //async get

    public async subscribeToStakingEvents() {
        
        if(this.accountData.stakingAddress != null) {

            this.infoWorker.addEventListener("message", async(event) => {

                //The event callback for GET_STAKING_INFO
                if(event.data.method == VultureMessage.GET_STAKING_INFO) {
                    if(event.data.params.success == true && event.data.params.stakingInfo.stakingAddress == this.accountData.stakingAddress!) {
                        let stakingInfo = event.data.params.stakingInfo as SubstrateStakingInfo;

                        // This is fking stupid, I could make a util method to do all this shit I know, I will on the refactoring stage.
                        let stakedBalance = new BigNumber(new BigNumber(stakingInfo.stakedBalance).div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)));
                        let frozenBalance = new BigNumber(new BigNumber(stakingInfo.frozenBalance).div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)));
                        let liquidBalance = new BigNumber(new BigNumber(stakingInfo.liquidBalance).div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)));

                        let newStakingInfo: SubstrateStakingInfo = {
                            stakingAddress: stakingInfo.stakingAddress,
                            controllerAddress: stakingInfo.controllerAddress,
                            isStashAccountBonded: stakingInfo.isStashAccountBonded,
                            frozenBalance: frozenBalance.toString(),
                            stakedBalance: stakedBalance.toString(),
                            liquidBalance: liquidBalance.toString(),
                            minimumBondAmount: new BigNumber(new BigNumber(stakingInfo.minimumBondAmount.replaceAll(',', '')).div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals))).toString(),
                            unlocking: stakingInfo.unlocking,
                            currentEra: stakingInfo.currentEra
                        };

                        this.accountData.stakingInfo.set(StakingInfo.Substrate, newStakingInfo);
                    }
                    if(event.data.params.success == false){
                        console.error("Error: Vulture worker failed to get staking info!");
                    }
                }
            
                //The event callback for SUB_TO_ACCOUNT_STATE
                if(event.data.method == VultureMessage.SUBSCRIBE_TO_ACC_EVENTS) {
                    if(event.data.params.success == true && event.data.params.address == this.accountData.stakingAddress!) {
    
                        //5 decimals is enuff (for this purpose of showing the amount)...
                        let free = new BigNumber(event.data.params.result.data.free);
    
                        let feeFrozen = new BigNumber(event.data.params.result.data.feeFrozen);
                        let miscFrozen = new BigNumber(event.data.params.result.data.miscFrozen);
    
                        let liquidAmount = free.minus(BigNumber.max(feeFrozen, miscFrozen));

                        let stakingInfo: SubstrateStakingInfo = this.accountData.stakingInfo.get(StakingInfo.Substrate);

                        stakingInfo.frozenBalance = miscFrozen.div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)).toString();
                        stakingInfo.liquidBalance = liquidAmount.div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals)).toString();

                        this.accountData.stakingInfo.set(StakingInfo.Substrate, stakingInfo);

                        this.infoWorker.postMessage({
                            method: VultureMessage.GET_STAKING_INFO,
                            params: {
                                address: this.accountData.address,
                                stakingAddress: this.accountData.stakingAddress!
                            }
                        });
                    }
                    if(event.data.params.success == false){
                        console.error("Error: Vulture worker failed to get wallet state!");
                    }
                }
            });
            this.infoWorker.postMessage({
                method: VultureMessage.SUBSCRIBE_TO_ACC_EVENTS,
                params: {
                    address: this.accountData.stakingAddress! // SUBSCRIBE_TO_ACC_EVENTS supports an optional address.
                }
            });
        }else {
            console.error("Cannot subscribe to staking events because staking address is null!");
        }
    }

    public async subscribeToAccountEvents() {
        this.infoWorker.addEventListener("message", async(event) => {
            
            //The event callback for SUB_TO_ACCOUNT_STATE
            if(event.data.method == VultureMessage.SUBSCRIBE_TO_ACC_EVENTS) {
                if(event.data.params.success == true && event.data.params.address == null) {

                    
                    //5 decimals is enuff (for this purpose of showing the amount)...
                    let free = new BigNumber(event.data.params.result.data.free);

                    let feeFrozen = new BigNumber(event.data.params.result.data.feeFrozen);
                    let miscFrozen = new BigNumber(event.data.params.result.data.miscFrozen);

                    let liquidAmount = free.minus(BigNumber.max(feeFrozen, miscFrozen));

                    //Our Whole asset amount is the result divided by 10 to the power of the denomination/smallest fraction.
                    let wholeAmount = liquidAmount.div(new BigNumber(10).pow(this.currentNetwork.networkAssetDecimals));
                    
                    this.accountData.freeAmountWhole = wholeAmount.toNumber();
                    this.accountData.freeAmountSmallestFraction = liquidAmount.toString();
                    this.accountData.accountNonce = event.data.params.result.nonce;

                    this.accountEvents.emit(VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, {
                        amount: wholeAmount.toString(),
                        address: this.accountData.address,
                    });

                    //Update tokens as well.
                    this.accountEvents.emit(VultureMessage.GET_TOKEN_BALANCE);
                }
                if(event.data.params.success == false){
                    console.error("Error: Vulture worker failed to get wallet state!");
                }
            }
        });

        this.infoWorker.postMessage({
            method: VultureMessage.SUBSCRIBE_TO_ACC_EVENTS,
            params: {
                address: null // A null address means the default address of the account.
            }
        });
    }
}