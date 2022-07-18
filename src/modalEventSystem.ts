import SafeEventEmitter from "@metamask/safe-event-emitter";
import { TokenTypes } from "./vulture_backend/types/tokenTypes";

export class ModalEventSystem {
    public modalEvents: SafeEventEmitter;

    private currentModalData: any;

    constructor() {
        this.modalEvents = new SafeEventEmitter();
        this.modalEvents.setMaxListeners(10);
    }

    openModal(modal: ModalEvents, modalData: any) {
        this.modalEvents.emit("OpenModal", {
            modal: modal
        });
        this.currentModalData = modalData;
    }
    getModalData(): any {
        return this.currentModalData;
    }
    closeModal() {
        this.modalEvents.emit("OpenModal", {
            modal: ModalEvents.NONE
        });
        this.currentModalData = null;
    }
}

// All current modals
export enum ModalEvents{
    // Account Management.
    CREATE_NEW_ACCOUNT = "CREATE_NEW_ACCOUNT",
    SELECT_ACCOUNT = "SELECT_ACCOUNT",
    MODIFY_ACCOUNT = "MODIFY_ACCOUNT",
    SELECT_NETWORK = "SELECT_NETWORK",

    // Token stuff
    VIEW_TOKEN_INFO = "VIEW_TOKEN_INFO", 
    SELECT_ASSET = "SELECT_ASSET",
    ADD_TOKEN = "ADD_TOKEN",

    TRANSFER_ASSETS = "TRANSFER_ASSETS",
    
    // Staking
    TRANSFER_BETWEEN_STAKING_ACCOUNT = "TRANSFER_BETWEEN_STAKING_ACCOUNT", 
    BOND_FUNDS = "BOND_FUNDS",
    INCREASE_BOND = "INCREASE_BOND",
    UNBOND = "UNBOND",

    RESET_WALLET = "RESET_WALLET",
    NONE = "NONE",
}
export interface TransferAssetsData {
    amount: number,
    recipent: string,
    addressOfTokenToTransfer?: string
}
export interface ModifyAccountData {
    arrayIndexOfAccount: number
}
export interface AddTokenData {
    tokenType: TokenTypes,
}
export interface ViewTokenInfoData {
    tokenType: TokenTypes,
    tokenAddress: string,
}