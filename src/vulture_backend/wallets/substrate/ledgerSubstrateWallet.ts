import { AccountData } from "../vultureWallet";
import SafeEventEmitter from "@metamask/safe-event-emitter";

import { BigNumber } from "bignumber.js";
import { VultureMessage } from "../../vultureMessage";
import { AbstractToken } from "../../types/abstractToken";
import { SubstrateInitData } from "../../../../vulture_scripts/src/apis/substrate/substrateActions";
import { Network, NetworkFeatures } from "../../types/networks/networkTypes";
import { StakingInfo, SubstrateBondData, SubstrateStakingInfo } from "../../types/stakingInfo";
import { VultureAccount } from "../IVultureAccount";
import { WalletType } from "../walletType";



export class LedgerSubstrateWallet implements VultureAccount {
    infoWorker: Worker;
    actionWorker: Worker;
    accountEvents: SafeEventEmitter = new SafeEventEmitter();
    updateTokenBalance: any;
    accountData: AccountData;
    isReady: boolean;

    network: Network;

    constructor(accountData: AccountData, network: Network) {
        this.accountEvents.setMaxListeners(50);
        this.accountData = accountData;
        this.isReady = false;
        this.network = network;

        // Create the two wallet back-end workers. These handle most of the hard work.
        this.actionWorker = new Worker('accountActionWorker-bundle.js', {
            type: 'module',
            credentials: 'same-origin'
        });
        this.infoWorker = new Worker('accountInfoWorker-bundle.js', {
            type: 'module',
            credentials: "same-origin"
        });
    }

    transferAssets(destination: string, amountWhole: number, token?: AbstractToken, from?: { address: string; derivationPath: string; }): Promise<void> {
        throw new Error("Method not implemented.");
    }
    estimateTxFee(destination: string, amountWhole: number, token?: AbstractToken): Promise<any> {
        throw new Error("Method not implemented.");
    }
    withdrawAllPayouts(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    nominate(nomineeAddress: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    unbond(unbondAmount: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    bond(stakingData: SubstrateBondData): Promise<any> {
        throw new Error("Method not implemented.");
    }
    isAddressValid(address: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getTokenInformation(tokenAddress: string, tokenType: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    terminateWallet(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}