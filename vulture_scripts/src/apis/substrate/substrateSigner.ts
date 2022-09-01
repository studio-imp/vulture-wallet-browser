import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { createSubmittable } from "@polkadot/api/submittable";
import Keyring from "@polkadot/keyring";
import { KeyringPair } from '@polkadot/keyring/types';
import { WalletType } from "../../../../src/vulture_backend/wallets/walletType";
import { ISigner } from "../ISigner";
import { TransactionFormats, VultureTx } from "../IVultureTx";
import { SubstrateInitData } from "./substrateActions";

export class SubstrateSigner implements ISigner {
    currentSignerType: WalletType;
    hardwareDevice?: any | undefined;
    secret?: string | undefined;

    keyring?: Keyring;
    currentKeypair?: KeyringPair;

    constructor(walletType: WalletType, substrateData: SubstrateInitData, hardwareDevice?: any)
    {
        // The seed phrase, will later on be completely hidden.
        this.secret = substrateData.seedPhrase == null ? undefined : substrateData.seedPhrase;
        this.hardwareDevice = hardwareDevice == null ? undefined : hardwareDevice;
        this.currentSignerType = walletType;

        if(this.secret != null) {
            this.keyring = new Keyring({
                type: substrateData?.ss58Format == "sr25519" ? 'sr25519' : 'sr25519',
                ss58Format: Number(substrateData?.ss58Format == null ? '45' :  substrateData.ss58Format)
            });
            this.currentKeypair = this.keyring.addFromUri(this.secret + substrateData?.derivationPath);
        }
        
    }
    signTransactionBy(derivationPath: string, tx: VultureTx): Promise<any> {
        let currentSignerType = this.currentSignerType;
        // temporary basically...
        let currentKeypair = this.keyring!.addFromUri(this.secret! + derivationPath);

        return new Promise(async function(resolve, reject) {
            if(tx.transactionFormat != TransactionFormats.SubstrateExtrinsic) {
                reject("The transaction is not a substrate extrinsic. The SubstrateSigner requires this!");
            }
            if(currentSignerType == WalletType.MnemonicPhrase) {
                let e = tx.transactionData as SubmittableExtrinsic<'promise'>;
                await e.signAsync(currentKeypair);
                resolve(e);
            }else {
                reject("Ledger is not currently supported!");
            }
        });
    }
    /// Signs a transaction with the current keypair.
    signTransaction(tx: VultureTx): Promise<any> {

        let currentSignerType = this.currentSignerType;
        let currentKeypair = this.currentKeypair!;

        return new Promise(async function(resolve, reject) {
            if(tx.transactionFormat != TransactionFormats.SubstrateExtrinsic) {
                reject("The transaction is not a substrate extrinsic. The SubstrateSigner requires this!");
            }
            if(currentSignerType == WalletType.MnemonicPhrase) {
                let e = tx.transactionData as SubmittableExtrinsic<'promise'>;
                await e.signAsync(currentKeypair);
                resolve(e);
            }else {
                reject("Ledger is not currently supported!");
            }
        });
    }
    /// Updates the signer to use a new address/hardware device.
    updateSigner(signerType: WalletType, substrateData?: SubstrateInitData, hwData?: any): Promise<any> {
        return new Promise(function(resolve, reject) {
            if(signerType == WalletType.MnemonicPhrase) {
                if(this.secret != null && substrateData != null) {
                    this.keyring.setSS58Format(Number(substrateData?.ss58Format == null ? '45' :  substrateData.ss58Format));
                    this.currentKeypair = this.keyring.addFromUri(this.secret + substrateData.derivationPath);
                }else {
                    reject("Not enough data provided to signer to update it!");
                }
            }else {
                reject("Ledger is not currently supported!");
            }
        });
    }
    signMessage(message: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    requestSecret(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
}