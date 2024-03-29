import { AbstractToken } from "../../../src/vulture_backend/types/abstractToken";
import { Network } from "../../../src/vulture_backend/types/networks/networkTypes";
import { SubstrateBondData } from "../../../src/vulture_backend/types/stakingInfo";
import { TokenTypes } from "../../../src/vulture_backend/types/tokenTypes";
import { AccountData } from "../../../src/vulture_backend/wallets/vultureWallet";

export class MethodResponse {
    method: string;
    params: any;

    constructor(method: string, params: any) {
        this.method = method;
        this.params = params;
    }
}

export interface VultureNetwork {
    currentAddress: string,
    networkURI: string,

    getAddress(): void;
    generateAddress(derivationPath: string, accountIndex: number): void,
    updateAccountsToNetwork(accounts: AccountData[], network: Network): void,
    transferAssets(recipent: string, amount: string, token?: AbstractToken): void;
    estimateTxFee(recipent: string, amount: string, token?: AbstractToken): void;
    validateAddress(address: string): void;
    getTokenData(tokenAddress: string, tokenType: string): Promise<void>;
    getBalanceOfToken(tokenAddress: string, tokenType: string, arrayIndexOfToken?: number): Promise<void>;
    getAddressState(): void;
    subscribeToAddressUpdates(): void;
}

export interface AccountActionHandler {
    address: string,
    networkURI: string,

    updateAccountsToNetwork(accounts: AccountData[], network: Network): Promise<void>,
    withdrawAllPayouts(stakingAddress: string): Promise<void>;
    nominateValidator(nominee: string): Promise<void>;
    generateAddress(derivationPath: string, accountIndex: number): Promise<void>,           // This last parameter is specifically needed when an account has two addresses. 
    transferAssets(recipentAddress: string, amount: string, token?: AbstractToken, from?: {address: string, derivationPath: string} ): Promise<void>;
    estimateTxFee(recipent: string, amount: string, token?: AbstractToken): Promise<void>;
    unstakeFunds(amountToUnbondWhole: string): Promise<void>;
    getAddress(): Promise<void>;
    stakeFunds(bondData: SubstrateBondData): Promise<void>;
}

export interface AccountInfoHandler {
    address: string,
    networkURI: string,

    subscribeToAddressEvents(address?: string): Promise<void>;
    addTokenToSubscription(tokenAddress: string, tokenType: string): Promise<void>;
    getBalanceOfToken(tokenAddress: string, tokenType: string): Promise<void>;
    getValidatorInfo(): Promise<void>;
    getTokenMetadata(tokenAddress: string, tokenType: TokenTypes, tokenId?: number): Promise<void>;
    validateAddress(address: string): Promise<void>;
    getStakingInfo(address: string, stakingAddress: string): Promise<void>;
    getTokenData(tokenAddress: string, tokenType: string): Promise<void>;
    getBalanceOf(address: string): Promise<void>;
    setAddress(address: string): Promise<void>;
}