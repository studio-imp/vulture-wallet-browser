import { WalletType } from "../../../src/vulture_backend/wallets/walletType";
import { VultureTx } from "./IVultureTx";


export interface ISigner {
    currentSignerType: WalletType;
    hardwareDevice?: any;
    secret?: string;
    signMessage(message: string): Promise<any>;
    signTransaction(tx: VultureTx): Promise<any>;
    requestSecret(): Promise<any>;
}