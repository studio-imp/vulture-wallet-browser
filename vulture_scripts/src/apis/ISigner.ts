import { WalletType } from "../../../src/vulture_backend/wallets/walletType";
import { VultureTx } from "./IVultureTx";
import { SubstrateInitData } from "./substrate/substrateActions";


export interface ISigner {
    currentSignerType: WalletType;
    hardwareDevice?: any;
    secret?: string;

    signTransaction(tx: VultureTx): Promise<any>;
    signTransactionBy(derivationPath: string, tx: VultureTx): Promise<any>;

    requestSecret(): Promise<any>;
    updateSigner(signerType: WalletType, substrateData?: SubstrateInitData, hwData?: any): Promise<any>;
    signMessage(message: string): Promise<any>;
}