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
    CREATE_NEW_ACCOUNT = "CREATE_NEW_ACCOUNT", // MIGRATION DONE
    SELECT_ACCOUNT = "SELECT_ACCOUNT",
    MODIFY_ACCOUNT = "MODIFY_ACCOUNT", // MIGRATION DONE

    VIEW_TOKEN_INFO = "VIEW_TOKEN_INFO", // MIGRATION DONE
    SELECT_ASSET = "SELECT_ASSET",
    ADD_TOKEN = "ADD_TOKEN", // MIGRATION DONE

    TRANSFER_ASSETS = "TRANSFER_ASSETS",
    SELECT_NETWORK = "SELECT_NETWORK",

    RESET_WALLET = "RESET_WALLET",
    NONE = "NONE",
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