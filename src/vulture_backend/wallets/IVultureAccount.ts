import SafeEventEmitter from "@metamask/safe-event-emitter";
import { AbstractToken } from "../types/abstractToken";
import { SubstrateBondData } from "../types/stakingInfo";
import { AccountData } from "./vultureWallet";

/** ## VultureAccount
 * the Vulture wallet will create accounts where the derivation-path is incremented with every account. A VultureAccount
 * represents an account in its entire form, i.e address, derivation path, the amount the address has, the network it is
 * connected to, as well as methods that can be called to do things such as transfer assets.
 */
 export interface VultureAccount {

    infoWorker: Worker;
    actionWorker: Worker;

    /** ## accountEvents
    * Due to the fact that a lot of computations happen in service & web workers, we use events
    * to communicate the result of certain computations.
    * 
    * An example would be estimating a transaction fee, the flow of such a task would be something
    * like this:
    * 
    * ### Example:
    * 
    * ```
    * let account: VultureAccountImplementor;
    * let currentFee: number = 0;
    * 
    * //Setup a once event callback for estimating a tx fee
    * account.accountEvents.once(vultureMessage.ESTIMATE_TX_FEE, (fee) => {
    *       console.log("Fee in precise Whole units: " + fee);
    *       currentFee = fee; 
    * });
    * 
    * //Call the estimateTxFee(); Method that exists in VultureAccount implementors/
    * account.estimateTxFee('Destination', '1.42');
    * ```
    */
    accountEvents: SafeEventEmitter;

    updateTokenBalance: any;

    /** ## accountData
    * The relevant Data each VultureAccount has, for example the address, derivation path, name, assetAmount, etc.
    */
    accountData: AccountData;

    /** ## isReady
     *  if the wallet is now able to read/send data.
     * 
     */
     isReady: boolean;

    /** ## transferAssets();
     * docs: Todo
     */
    transferAssets(destination: string, amountWhole: number, token?: AbstractToken, from?: {address: string, derivationPath: string}): Promise<void>;
    /** ## estimateTxFee();
     * docs: Todo
     */
    estimateTxFee(destination: string, amountWhole: number, token?: AbstractToken): Promise<any>;

    /** I'll do todo's later
     * 
     */
    withdrawAllPayouts(): Promise<any>;
    nominate(nomineeAddress: string): Promise<any>;
    unbond(unbondAmount: string): Promise<any>;
    bond(stakingData: SubstrateBondData): Promise<any>;

    
    isAddressValid(address: string): Promise<void>;
    /** ## getTokenInformation();
     * Returns information about a token, the tokenAddress could point to an ERC20 or ERC721 token, or
     * a native token depending on the currently selected network.
     * 
     * 
     * tokenType refers to the type of the token, as stated above, this could be "ERC20", "ERC721", "NATIVE",
     * or more. The currently available tokenTypes are written below:
     * 
     * * "ERC20"
     * * "ERC721"
     * * "NATIVE"
     */
    getTokenInformation(tokenAddress: string, tokenType: string): Promise<void>;

    terminateWallet(): Promise<void>;
}