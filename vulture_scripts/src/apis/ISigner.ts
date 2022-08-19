import { WalletType } from "../../../src/vulture_backend/wallets/walletType";


export interface ISigner {
    currentSignerType: WalletType;
    secret?: string;
    signPayload(payload: string): Promise<any>;
    signMessage(message: string): Promise<any>;
    requestSecret(): Promise<any>;
}