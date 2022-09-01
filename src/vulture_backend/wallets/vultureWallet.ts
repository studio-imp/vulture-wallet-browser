import localforage from "localforage";
import { VultureMessage } from "../vultureMessage";
import { encrypt } from "@metamask/browser-passworder";
import { MnemonicSubstrateWallet } from "./substrate/mnemonicSubstrateWallet";
import SafeEventEmitter from "@metamask/safe-event-emitter";
import { AbstractToken, TokenStore } from "../types/abstractToken";
import { Network, NetworkFeatures } from "../types/networks/networkTypes";
import { TokenTypes } from "../types/tokenTypes";
import { VultureRequest } from "../vultureRPC";
import { StakingInfo, SubstrateBondData } from "../types/stakingInfo";
import { DefaultNetworks } from "../types/networks/network";
import BigNumber from "bignumber.js";
import { VultureAccount } from "./IVultureAccount";
import { WalletType } from "./walletType";

/* --- Note # PSYCODERS # we are one @
    vultureWallet.ts contains interfaces that are used by the Vulture wallet.

    The accounts-system that Vulture uses is as follows:
    The user can create multiple accounts, each account will increment the derivation path to derive
    a new account (always hardened accounts).

    Each account can also be manually set to use different networks that are based on Substrate, (Aleph Zero by default).
*/


/*@---------------------------------Wallet Interfaces/Enums-------------------------------@*/

export interface Vault {
    seed: string
}

/** ## AccountData
* The relevant Data each VultureAccount has, for example the address, derivation path, name, assetAmount, etc.
*/
export interface AccountData {
    /** ## accountName 
    * An arbitrary name given by the user whenever they create an account! :)
    */
    accountName: string,
    /** ## address 
    * The address of this account.
    */
    address: string,


    /** ## stakingAddress
     *  Each vultureAccount will come with two addresses, a main address and
     *  a staking address, due to the fact that not all networks support staking
     *  we'll  assing this address on account-generation manually. Each network
     *  has a corresponding worker method to retrieve staking addresses.
     */
    stakingAddress?: string

    /** stakingInfo
     * Some networks may have an additional staking info. Vulture handles staking
     * by having two different addresses per account, one specific for staking and one
     * for other usecases.
     */
    stakingInfo: Map<StakingInfo, any>,

    /** ## derivationPath 
    * the Derivation path of this account, vulture uses
    * `//hard-value/soft-value`, where we increment the hard-value
    * every account.
    */
    derivationPath: string;
    /** ## freeAmount 
    * The free amount of native assets this account holds (on the current network
    * the acccount is connected to).
    * 
    * Precise up to 9 decimals.
    * 
    * This amount is Whole, meaning not a fraction of a whole unit of whatever asset the
    * VultureAccount network is connected to.
    */
    /** ## accountIndex 
    * The hard-value number in the derivation path.
    */
    accountIndex: number;
    freeAmountWhole: number;
    freeAmountSmallestFraction: string;
    accountNonce: number;
    walletType: WalletType;

    /** ## tokens
     * Optional token/asset store.
     * 
     * It is important to note that the AbstractToken interface
     * is an abstract interface which also contains the network-information (tokens
     * are on a per-network basis). The AbstractToken interface may represent ERC20 tokens,
     * and also native assets that reside within blockchains. The Vulture back-end will handle
     * tokens differently depending on the currently selected network.
     */
    tokens?: AbstractToken[];
}


/** # VultureAccountStore
 * Stores information about all accounts the wallet has, not including
 * a seed-phrase/private key.
 */
export interface VultureAccountStore {
    allAccounts: AccountData[],
    nextAccountDerivIndex: number,
    currentlySelectedNetwork: Network,
    currentlySelectedAccount: number
}

/*@---------------------------------Wallet Classes-------------------------------@*/

export class VultureWallet {

    public currentWallet!: VultureAccount;
    public nextDerivIndex: number = 0;
    public vault!: Vault;
    public selectedWalletIndex!: number;

    public accountStore!: VultureAccountStore;

    public tokenStore!: TokenStore;

    public walletEvents: SafeEventEmitter = new SafeEventEmitter();

    public isWalletReady: boolean = false;

    constructor(vault?: Vault, accountStore?: VultureAccountStore) {
        this.walletEvents.setMaxListeners(50);
        if(vault && accountStore)
        {
            this.accountStore = accountStore;

            loadTokenStore(accountStore?.currentlySelectedNetwork).then((store) => {
                this.tokenStore = store;
            });

            this.selectedWalletIndex = accountStore.currentlySelectedAccount;
            this.vault = vault;
            this.nextDerivIndex = accountStore.nextAccountDerivIndex;
            if(accountStore.allAccounts[accountStore.currentlySelectedAccount - 1].walletType == WalletType.MnemonicPhrase) {
                this.currentWallet = new MnemonicSubstrateWallet(vault.seed, accountStore.allAccounts[accountStore.currentlySelectedAccount - 1], accountStore.currentlySelectedNetwork);
            }else {
                console.error("Error: Ledger wallets not currently supported!");
            }
        }
    }

    async initWallet(vault: Vault, accountStore: VultureAccountStore) {

        // If we are switching/initializing to a new wallet, we must terminate the processes for the old one.
        if(this.currentWallet != null) {
            this.currentWallet.terminateWallet();
        }
        
        this.accountStore = accountStore;

        this.tokenStore = await loadTokenStore(this.accountStore.currentlySelectedNetwork);
        
        this.vault = vault;
        this.nextDerivIndex = accountStore.nextAccountDerivIndex;
        this.selectedWalletIndex = accountStore.currentlySelectedAccount;
        
        // If the currently selected account is available, if it isn't we fallback to using the first account.
        // The reason this check is necessary is due to updates possibly resetting the currentlySelectedAccount value. 
        if(accountStore.allAccounts[accountStore.currentlySelectedAccount - 1]) {
            if(accountStore.allAccounts[accountStore.currentlySelectedAccount - 1].walletType == WalletType.MnemonicPhrase) {
                this.currentWallet = new MnemonicSubstrateWallet(vault.seed, accountStore.allAccounts[accountStore.currentlySelectedAccount - 1], accountStore.currentlySelectedNetwork);
            }else {
                console.error("Error: Ledger wallets not currently supported!");

                /*
                if(networks.allNetworks.get(networkName)) {
                    this.accountStore.currentlySelectedNetwork = networks.allNetworks.get(networkName) as Network;
                    this.saveAccounts();
                    this.updateAccountAddresses(true);
                }else {
                    console.error("Network: " + networkName + " Doesn't exist!");
                    return;
                }
                */
            }
        }else {
            if(accountStore.allAccounts[0].walletType == WalletType.MnemonicPhrase) {
                this.accountStore.currentlySelectedAccount = 0;
                this.saveAccounts();
                this.currentWallet = new MnemonicSubstrateWallet(vault.seed, accountStore.allAccounts[0], accountStore.currentlySelectedNetwork);
            }else {
                console.error("Error: Ledger wallets not currently supported!");
            }
        }
        // Start polling token balances instantly when the info worker is ready.s
        this.currentWallet.accountEvents.on("infoWorkerReady", async () => {
            this.walletEvents.emit('IsWalletReady', this.currentWallet.isReady);
            await this.startTokenBalancePolling();
        });

       //TODO: REMOVE 
       ////Set the callback for updating token balances here, it's wonky but I'll refactor the way this works eventually.
       this.currentWallet.accountEvents.on(VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, (data) => {
           this.walletEvents.emit(VultureMessage.SUBSCRIBE_TO_ACC_EVENTS, data);
       });

       this.currentWallet.infoWorker.addEventListener("message", async(event) => {
            if(event.data.method == VultureMessage.GET_TOKEN_BALANCE) {
                if(event.data.params.success == true) {
                    switch(event.data.params.tokenType) {
                        case 'ERC20': {
                             if(this.tokenStore.tokenList.has(this.accountStore.currentlySelectedNetwork.networkUri)) {
                                let nftList = this.tokenStore.tokenList.get(this.accountStore.currentlySelectedNetwork.networkUri)!;
                                if(nftList.has(event.data.params.tokenAddress)) {
                                   this.tokenStore.tokenList
                                   .get(this.accountStore.currentlySelectedNetwork.networkUri)!
                                   .get(event.data.params.tokenAddress)!
                                   .balance = event.data.params.balance;
                                }
                             }
                            break;
                        }
                        case 'ERC721': {
                             if(this.tokenStore.NFTList.has(this.accountStore.currentlySelectedNetwork.networkUri)) {
                                let nftList = this.tokenStore.NFTList.get(this.accountStore.currentlySelectedNetwork.networkUri)!;
                                if(nftList.has(event.data.params.tokenAddress)) {
                                   this.tokenStore.NFTList
                                   .get(this.accountStore.currentlySelectedNetwork.networkUri)!
                                   .get(event.data.params.tokenAddress)!
                                   .balance = event.data.params.balance;
                                }
                             }
                            break;
                        }
                        default: {
                            console.warn("Token Type: " + event.data.params.tokenType + " is Invalid!");
                            break;
                        }
                    }

                }else {
                    console.error("Error getting balance of token " + event.data.params.tokenAddress);
                    if(this.tokenStore.tokenList.has(this.accountStore.currentlySelectedNetwork.networkUri)) {
                        this.tokenStore.tokenList
                        .get(this.accountStore.currentlySelectedNetwork.networkUri)!
                        .get(event.data.params.tokenAddress)!
                        .balance = "Error";
                    }
                }
            }
       });
    }
    async getTokenMetadata(tokenAddress: string, tokenType: TokenTypes, tokenId?: number) {
        switch(tokenType) {
            case TokenTypes.ERC20: {
                console.error("ERC20 tokens do not contain a metadata method!");
                break;
            }
            case TokenTypes.ERC721: {
                this.currentWallet.infoWorker.postMessage({
                    method: VultureMessage.GET_TOKEN_METADATA,
                    tokenAddress: tokenAddress,
                    tokenId: tokenId != null ? tokenId : null,
                });
                break;
            }
            default: {
                console.error("Token Type: " + tokenType + " is invalid!");
                break;
            }
        }
    }
    getTokens(): AbstractToken[] {
        let r: AbstractToken[] = [];
        if(this.tokenStore.tokenList.has(this.accountStore.currentlySelectedNetwork.networkUri)) {
            r = Array.from(this.tokenStore.tokenList.get(this.accountStore.currentlySelectedNetwork.networkUri)!.values());
        }
        return r;
    }
    getNFTs(): AbstractToken[] {
        let r: AbstractToken[] = [];
        if(this.tokenStore.NFTList.has(this.accountStore.currentlySelectedNetwork.networkUri)) {
            r = Array.from(this.tokenStore.NFTList.get(this.accountStore.currentlySelectedNetwork.networkUri)!.values());
        }
        return r;
    }
    async switchWallet(index: number) {
        this.accountStore.currentlySelectedAccount = index;
        this.saveAccounts();
        this.initWallet(this.vault, this.accountStore);
    }
    async startTokenBalancePolling() {        
        if(this.tokenStore.tokenList.get(this.accountStore.currentlySelectedNetwork.networkUri) != null) {
            // Get balance of every ERC20 token. We have to manually poll in the worker since subscriptions don't work for this *yet*.
            Array.from(this.tokenStore.tokenList!.get(this.accountStore.currentlySelectedNetwork.networkUri)!.values()).forEach((token) => {
                this.currentWallet.infoWorker.postMessage({
                    method: VultureMessage.ADD_TOKEN_TO_SUBSCRIPTION,
                    params: {
                        tokenAddress: token.address,
                        tokenType: 'ERC20'
                    },
                });
            });
        }
        if(this.tokenStore.NFTList.get(this.accountStore.currentlySelectedNetwork.networkUri) != null) {
            // Get balance of every ERC721 token. We have to manually poll in the worker since subscriptions don't work for this *yet*.
            Array.from(this.tokenStore.NFTList!.get(this.accountStore.currentlySelectedNetwork.networkUri)!.values()).forEach((token) => {
                this.currentWallet.infoWorker.postMessage({
                    method: VultureMessage.ADD_TOKEN_TO_SUBSCRIPTION,
                    params: {
                        tokenAddress: token.address,
                        tokenType: 'ERC721'
                    },
                });
            });
        }
    }
    
    switchNetwork(networkName: string) {
        const networks = new DefaultNetworks();
        //Switch the network
        if(networks.allNetworks.get(networkName)) {
            this.accountStore.currentlySelectedNetwork = networks.allNetworks.get(networkName) as Network;
            this.saveAccounts();
            this.updateAccountAddresses(true);
        }else {
            console.error("Network: " + networkName + " Doesn't exist!");
            return;
        }
    }    
    addTokenToList(token: AbstractToken, tokenType: string) {
        switch(tokenType) {
            case 'ERC20': {
                addTokenToStore(this.accountStore.currentlySelectedNetwork, false, token).then((store) => {
                    if(store != null) {
                        this.tokenStore = store;
                        this.currentWallet.infoWorker.postMessage({
                            method: VultureMessage.ADD_TOKEN_TO_SUBSCRIPTION,
                            params: {
                                tokenAddress: token.address,
                                tokenType: 'ERC20'
                            },
                        });
                    }else {
                        console.error("Failed adding token, store not found!");
                    }
                });
                break;
            }
            case 'ERC721': {
                addTokenToStore(this.accountStore.currentlySelectedNetwork, true, token).then((store) => {
                    if(store != null) {
                        this.tokenStore = store;
                        this.currentWallet.infoWorker.postMessage({
                            method: VultureMessage.ADD_TOKEN_TO_SUBSCRIPTION,
                            params: {
                                tokenAddress: token.address,
                                tokenType: 'ERC721'
                            },
                        });
                    }else {
                        console.error("Failed adding token, store not found!");
                    }
                });
                break;
            }
        }
    }
    removeTokenFromList(tokenAddress: string, tokenType: string) {
        switch(tokenType) {
            case 'ERC20': {
                removeTokenFromStore(this.accountStore.currentlySelectedNetwork, false, tokenAddress).then((store) => {
                    if(store != null) {
                        this.tokenStore = store;
                    }else {
                        console.error("Failed removing token, store not found!");
                    }
                });
                break;
            }
            case 'ERC721': {
                removeTokenFromStore(this.accountStore.currentlySelectedNetwork, true, tokenAddress).then((store) => {
                    if(store != null) {
                        this.tokenStore = store;
                    }else {
                        console.error("Failed removing token, store not found!");
                    }
                });
                break;
            }
        }
    }
    updateAccountAddresses(reInitializeWallet: boolean) {
        this.currentWallet.actionWorker.onmessage = (event) => { // TODO: UPDATE TO METHOD
            if(event.data.method == VultureMessage.UPDATE_ACCOUNTS_TO_NETWORK) {
                if(event.data.params.success == true) {
                    this.accountStore.allAccounts = event.data.params.updatedAccounts;

                    // Also update the current wallets' staking address, if the network supports staking.
                    if(this.supportsFeature(NetworkFeatures.STAKING)) {
                        this.generateAddress("//staking_" + this.currentWallet.accountData.accountIndex).then((data) => {
                            this.currentWallet.accountData.stakingAddress = data.params.address;
                        });
                    }

                    this.saveAccounts();
                }else {
                    console.error("Failed updating accounts to use new network format!");
                }
            }
            if(reInitializeWallet) {
                //initialize the wallet again but with the new network.
                this.initWallet(this.vault, this.accountStore);
            }
        };
        this.currentWallet.actionWorker.postMessage({ // TODO: UPDATE TO METHOD
            method: VultureMessage.UPDATE_ACCOUNTS_TO_NETWORK,
            params: {
                accounts: JSON.parse(JSON.stringify(this.accountStore.allAccounts)),
                network: JSON.parse(JSON.stringify(this.accountStore.currentlySelectedNetwork)),
            },
        });
    }
    saveAccounts() {
        localforage.setItem("vultureAccounts", JSON.parse(JSON.stringify(this.accountStore))).catch((err) => {
            console.error(err);
        });
    }

    /** ## supportsFeature()
     * Checks if the **current network** supports the feature passed into the
     * `feature` parameter.
     */
    supportsFeature(feature: NetworkFeatures): boolean {
        if(this.accountStore != null && this.accountStore.currentlySelectedNetwork != null) {
            return this.accountStore.currentlySelectedNetwork.networkFeatures & feature ? true : false;
        }else {
            return false;
        }
    }
    /** ## estimateTxFee
     * This function will return the estimated Tx fee.
     * 
     * @param destination 
     * @param amountWhole 
     * @param token 
     * @returns 
     */
    async estimateTxFee(destination: string, amountWhole: number, token?: AbstractToken): Promise<any> {
        return this.currentWallet.estimateTxFee(destination, amountWhole, token);
    }
    /** ## getBalanceOfAddress()
     *  Will return the balance of a specified address.
     */
    async getBalanceOfAddress(address: string): Promise<any> {
        let wallet = this.currentWallet;
        let networkDecimals = this.accountStore.currentlySelectedNetwork.networkAssetDecimals;
        return new Promise(function(resolve, reject) {
            wallet.infoWorker.onmessage = (event) => {
                if(event.data.method == VultureMessage.GET_BALANCE_OF_ADDRESS) {
                    if(event.data.params.address == address) { 
                                                // data.params.data.data, I know, be quiet.
                        let free = new BigNumber(event.data.params.data.data.free);
                        
                        let feeFrozen = new BigNumber(event.data.params.data.data.feeFrozen);
                        let miscFrozen = new BigNumber(event.data.params.data.data.miscFrozen);
                        
                        let liquidAmount = free.minus(BigNumber.max(feeFrozen, miscFrozen));
                        
                        //Our Whole asset amount is the result divided by 10 to the power of the denomination/smallest fraction.
                        let wholeAmount = liquidAmount.div(new BigNumber(10).pow(networkDecimals));
                    }
                }
            };

            wallet.infoWorker.postMessage({
                method: VultureMessage.GET_BALANCE_OF_ADDRESS,
                params: {
                    address: address
                }
            });
        });
    }
    /** ## generateAddress
     * Generates an address with the current seed the account has. Optional
     * derivation path parameter if you want to derive a specific account.
     * Derivation paths have to correspond to the current network formats.
     * 
     * the optional accountIndex parameter is an array-index, this parameter
     * will be returned by the worker after generation in order to know which
     * account in the array the address belongs to.
     */
    async generateAddress(derivationPath?: string, accountIndex?: number): Promise<any> {
        let wallet = this.currentWallet;
        return new Promise(function(resolve, reject) {

            wallet.actionWorker.onmessage = (event: any) => {
                if(event.data.method == VultureMessage.GET_ADDRESS_FROM_URI) {
                    if(event.data.params.success == true) {
                        resolve(event.data);
                    }else {
                        reject(new VultureRequest(VultureMessage.GET_ADDRESS_FROM_URI, {
                            success: false,
                            error: "Failed generating address!"
                        }));
                    }
                }
            };

            wallet.actionWorker.postMessage({
                method: VultureMessage.GET_ADDRESS_FROM_URI,
                params: {
                    addressURI: derivationPath,
                    accountIndex: accountIndex
                }
            });
        });
    }
    async getValidatorInfo(): Promise<any> {
        if(this.supportsFeature(NetworkFeatures.STAKING)) {
            let wallet = this.currentWallet;
            return new Promise(function(resolve, reject) {
    
                wallet.infoWorker.onmessage = (event: any) => {
                    if(event.data.method == VultureMessage.GET_VALIDATOR_LIST) {
                        if(event.data.params.success == true) {
                            resolve(event.data.params);
                        }else {
                            console.error("Failed getting staking info!");
                            reject(new VultureRequest(VultureMessage.GET_VALIDATOR_LIST, {
                                success: false,
                                error: "Failed getting staking info!"
                            }));
                        }
                    }
                };
    
                wallet.infoWorker.postMessage({
                    method: VultureMessage.GET_VALIDATOR_LIST,
                    params: {
                    }
                });
            });
        }else {
            console.error("Current network does not support staking!");
        }
    }
    /** ## getStakingInfo
     * Calls a worker method which retrieves staking/nomination information, this is abstract due to
     * the fact that staking works differently depending on each network, but for now we are focusing on
     * substrate.
     */
    async getStakingInfo(): Promise<any> {
        if(this.supportsFeature(NetworkFeatures.STAKING)) {
            let wallet = this.currentWallet;
            return new Promise(function(resolve, reject) {
    
                wallet.infoWorker.onmessage = (event: any) => {
                    if(event.data.method == VultureMessage.GET_STAKING_INFO) {
                        if(event.data.params.success == true) {
                            resolve(event.data);
                        }else {
                            console.error("Failed getting staking info!");
                            reject(new VultureRequest(VultureMessage.GET_STAKING_INFO, {
                                success: false,
                                error: "Failed getting staking info!"
                            }));
                        }
                    }
                };
    
                wallet.infoWorker.postMessage({
                    method: VultureMessage.GET_STAKING_INFO,
                    params: {
                        address: wallet.accountData.address,
                        stakingAddress: wallet.accountData.stakingAddress!,
                    }
                });
            });
        }else {
            console.error("Current network does not support staking!");
        }
    }
    createAccount(accountName: string, walletType: WalletType) {
        createNewAccount(accountName, walletType).then((account) => {
            this.currentWallet.actionWorker.onmessage = (event) => { // TODO: UPDATE TO METHOD
                if(event.data.method == VultureMessage.GET_ADDRESS_FROM_URI && event.data.params.success == true) {
                    this.accountStore.allAccounts[event.data.params.accountIndex - 1].address = event.data.params.address;
                    this.accountStore.nextAccountDerivIndex++;
                    this.nextDerivIndex = this.accountStore.nextAccountDerivIndex;
                    this.saveAccounts();
                }
            };

            //WASM makes it necessary to use postMessage for all sr25519 cryptography, makes things more
            //complicated to read and more asynchronous in nature but it's either that or use a native
            //js sr25519 package (no audited ones exist...).

            this.accountStore.allAccounts.push(account);
            this.currentWallet.actionWorker.postMessage({ // TODO: UPDATE TO METHOD
                method: VultureMessage.GET_ADDRESS_FROM_URI,
                params: {
                    accountIndex: this.accountStore.allAccounts.length,
                    addressURI: account.derivationPath,
                    //index: this.accountStore.allAccounts.length,
                }
            });
        });
    }
    popAccount() {
        removeLatestAccount().then((success) => {
            if(success) {
                //If the selected account is the one we are popping, select the previous account
                if(this.selectedWalletIndex == this.accountStore.allAccounts.length) {
                    this.selectedWalletIndex--;
                    this.switchWallet(this.selectedWalletIndex);
                }
                this.nextDerivIndex--;
                this.accountStore.allAccounts.pop();
                this.accountStore.nextAccountDerivIndex--;
                this.saveAccounts();
            }
        })
    }

}

/*@---------------------------------Wallet functions-------------------------------@*/

/** # doesWalletExist()
 *  Returns true or false depending on if a wallet has been created, Wallet meaning VultureAccountStore, not Seed-phrase.
 *  Although
 */
export async function doesWalletExist() {
    return localforage.getItem("vultureAccounts").then((value) => {
        if(value != null) {
            return true;
        } else {
            return false;
        }
    });
}

/** # deleteWallet()
 *  Deletes the wallet and all its data from storage. The user will need to
 *  create a new wallet.
 */
export async function deleteWallet() {
    await localforage.removeItem("vault");
    await localforage.removeItem("vultureAccounts");
}

/** # loadTokenStore()
 *  Loads the token store for the given network. The token store is saved as
 * `tokenStore_*NETWORK_RPC_URI*`.
 * 
 * If a `TokenStore` doesn't currently exist for the current network it will be
 * generated by this function, and returned.
 */
export async function loadTokenStore(network: Network) {
    let store;
    store = await localforage.getItem("tokenStore").then((value) => {
        if(value != null) {
            return value as TokenStore;
        }else {
            let tokenStore: TokenStore = {
                tokenList: new Map<string, Map<string, AbstractToken>>(),
                NFTList: new Map<string, Map<string, AbstractToken>>(),
            }
            localforage.setItem("tokenStore", tokenStore);
            return tokenStore;
        }
    });
    return store;
}
/** # addTokenToStore()
 *  Adds a token to the TokenStore of the current network. If the user has the token added it will show up
 *  on the front-end GUI.
 */
export async function addTokenToStore(network: Network, isNFT: boolean, token: AbstractToken){

    let res = await localforage.getItem("tokenStore").then((value) => {
        if(value != null) {
            let store = value as TokenStore;
            if(isNFT) {
                if(store.NFTList.get(network.networkUri)) {
                    store.NFTList.get(network.networkUri)?.set(token.address, JSON.parse(JSON.stringify(token)));
                    
                }else {
                    store.NFTList.set(network.networkUri, new Map<string, AbstractToken>());
                    store.NFTList.get(network.networkUri)?.set(token.address, JSON.parse(JSON.stringify(token)));
                }
            }else {
                if(store.tokenList.get(network.networkUri)) {
                    store.tokenList.get(network.networkUri)?.set(token.address, JSON.parse(JSON.stringify(token)));
                    
                }else {
                    store.tokenList.set(network.networkUri, new Map<string, AbstractToken>());
                    store.tokenList.get(network.networkUri)?.set(token.address, JSON.parse(JSON.stringify(token)));
                }
            }
            localforage.setItem("tokenStore", store);
            return store;
        }else {
            console.error("Current network does not have a token-store! Please create one with the `loadTokenStore();` function!");
            return null;
        }
    });
    return res;
}
/** # addTokenToStore()
 *  Adds a token to the TokenStore of the current network. If the user has the token added it will show up
 *  on the front-end GUI.
 */
 export async function removeTokenFromStore(network: Network, isNFT: boolean, tokenAddress: string){

    let res = await localforage.getItem("tokenStore").then((value) => {
        if(value != null) {
            let store = value as TokenStore;
            if(isNFT) {
                if(store.NFTList.get(network.networkUri)) {
                    store.NFTList.get(network.networkUri)?.delete(tokenAddress);
                    
                }else {
                    store.NFTList.set(network.networkUri, new Map<string, AbstractToken>());
                    console.info("Token doesn't exist in store because store doesn't exist! (creating store...)");
                }
            }else {
                if(store.tokenList.get(network.networkUri)) {
                    store.tokenList.get(network.networkUri)?.delete(tokenAddress);
                    
                }else {
                    store.tokenList.set(network.networkUri, new Map<string, AbstractToken>());
                    console.info("Token doesn't exist in store because store doesn't exist! (creating store...)");
                }
            }
            localforage.setItem("tokenStore", store);
            return store;
        }else {
            console.error("Current network does not have a token-store! Please create one with the `loadTokenStore();` function!");
            return null;
        }
    });
    return res;
}

export async function createVault(vault: any, password: string) {
    localforage.getItem("vault").then((value) => {
        if(value != null){
            console.error("Error: Tried creating a vault when a vault already exists!");
            return;
        }else {
            encrypt(password, vault).then( async (blob) => {
                localforage.setItem("vault", blob).catch((err) => {
                    console.error(err);
                    return;
                });
            });
            this.currentWallet.worker.postMessage({
                method: VultureMessage.SET_VAULT,
                vault: vault,
            });
        }
    });
}

/** loadVault()
 *  Loads the seed-phrase/Hardware-wallet transaport either from the vulture_worker.js service worker or from storage, if its not cached.
 *  Returns false if a seed-phrase doesn't exist all-together.
 * 
 * ## Note:
 * The value return is a `Vault` if found, and false if no Vault has been created (meaing no seed-phrase/hardware wallet).
 */
export async function loadVault() {
    let vault;
    vault = await localforage.getItem("vault").then((value) => {
        if(value != null) {
            return value as string;
        }else {
            return null;
        }
    });
    return vault;
}

export async function loadAccounts() {
    let store;
    store = await localforage.getItem("vultureAccounts").then((value) => {
        if(value != null) {
            let store = value as VultureAccountStore;

            /*--- Due to updating serialization, need to make sure the store contains this data! ---*/
            //Making sure that we have a default network.
            if(store.currentlySelectedNetwork == null) {
                store.currentlySelectedNetwork = new DefaultNetworks().AlephZero;
            }
            //Making sure that we have a nextAccountDerivIndex.
            if(store.nextAccountDerivIndex == null) {
                store.nextAccountDerivIndex = 1;
            }
            localforage.setItem("vultureAccounts", store);
            return store;
        }else {
            return null;
        }
    });
    return store;
}


/** # removeLatestAccount()
 * Accounts are pushed when added, and popped when removed. This makes managing the order of accounts
 * a lot easier. This function will remove the latest added account.
 * 
*/
export async function removeLatestAccount() {
    return localforage.getItem("vultureAccounts").then((value) => {
        if(value != null) {
            let val: VultureAccountStore = value as VultureAccountStore;
            if(val.allAccounts.length > 1) {
                val.allAccounts.pop();
                val.nextAccountDerivIndex--;
                localforage.setItem("vultureAccounts", val).catch((err) => {
                    console.error(err);
                });
                return true;
            } else {
                console.info("You can't remove your main account...");
                return false;
            }
        }else {
            console.info("Can't remove an account when u don't have one... ur an actual idiot if this message reaches the console.");
            return true;
        }
    });
}

export function hardWalletReset() {
    localforage.removeItem("vultureAccounts");
    localforage.removeItem("tokenStore");
    localforage.removeItem("vault");
}

/** # createNewAccount()
 * A function that creates and adds a new Vulture account to storage, this function is used to to
 * add/create new accounts, including the initial account, and also automatically save the account
 * in localstorage.
*/
export async function createNewAccount(accountName: string, walletType: WalletType, network?: Network,): Promise<AccountData> {
    return localforage.getItem("vultureAccounts").then((value) => {
        if(value != null) {
            let val: VultureAccountStore = value as VultureAccountStore;
            val.allAccounts.push({
                accountName: accountName,
                address: "",
                stakingInfo: new Map<StakingInfo, any>(),
                derivationPath: "//" + val.nextAccountDerivIndex,
                accountIndex: val.nextAccountDerivIndex,
                freeAmountWhole: 0,
                accountNonce: 0,
                freeAmountSmallestFraction: "0",
                walletType: walletType
            });
            val.nextAccountDerivIndex++;
            localforage.setItem("vultureAccounts", val).catch((err) => {
                console.error(err);
            });
            return val.allAccounts[val.allAccounts.length - 1];
        }else {
            let selectedNetwork = network != null ? network : new DefaultNetworks().AlephZero;
            let val: VultureAccountStore = {
                allAccounts: [{
                    accountName: accountName,
                    address: "",
                    derivationPath: "//0",
                    accountIndex: 0,
                    freeAmountWhole: 0,
                    stakingInfo: new Map<StakingInfo, any>(),
                    accountNonce: 0,
                    freeAmountSmallestFraction: "0",
                    walletType: walletType
                }],
                currentlySelectedNetwork: selectedNetwork,
                nextAccountDerivIndex: 1,
                currentlySelectedAccount: 1,
            }
            localforage.setItem("vultureAccounts", val).catch((err) => {
                console.error(err);
            });
            return val.allAccounts[val.allAccounts.length - 1];
        }
    });
}