import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { createSubmittable } from "@polkadot/api/submittable";
import Keyring from "@polkadot/keyring";
import { KeyringPair } from '@polkadot/keyring/types';
import { WalletType } from "../../../../src/vulture_backend/wallets/walletType";
import { ISigner } from "../ISigner";
import { TransactionFormats, VultureTx } from "../IVultureTx";

export class SubstrateSinger implements ISigner {
    currentSignerType: WalletType = WalletType.Ledger;
    hardwareDevice?: any | undefined;
    secret?: string | undefined;

    keyring?: Keyring;
    currentKeypair?: KeyringPair;

    constructor(walletType: WalletType, secret?: string, hardwareDevice?: any,
    derivationPath?: string, ss58Format?: string, keyringType?: string,)
    {
        this.secret = secret == null ? undefined : secret;
        this.hardwareDevice = hardwareDevice == null ? undefined : hardwareDevice;
        this.currentSignerType = walletType;

        
    }

    signTransaction(tx: VultureTx): Promise<any> {
        return new Promise(function(resolve, reject) {
            if(tx.transactionFormat != TransactionFormats.SubstrateExtrinsic) {
                reject("The transaction is not a substrate extrinsic. The SubstrateSigner requires this!");
            }
            let e = tx.transactionData as SubmittableExtrinsic<'promise'>;
           
        });
    }
    signMessage(message: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    requestSecret(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}