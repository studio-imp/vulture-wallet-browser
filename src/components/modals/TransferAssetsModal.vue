<template>
    <div class="flexBox" style="height: 100%; width: 100%;">
        <div class="flexBox" style="flex-grow: 1; padding-left: 15px; padding-right: 15px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 25px; box-sizing: border-box; font-size: 20px;
        overflow-wrap: break-word;">
            
            <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                align-items: center; justify-content: center;">
                <div style="font-size: 24px; ">
                Send Assets
                </div>
                <div style="font-size: 24px; margin-left: 5px; margin-top: 3px;" class="fonticon">
                    &#xef63;
                </div>
            </div>
            <hr style="width: 100%; margin-bottom: 15px;">

            <div class="outline">
                <div class="infoParagraph">
                    Send: <span class="accentColored">{{assetTransferData.amount}}</span> <span style="font-size: 18px;">$<span class="accentColored">{{asset}}</span></span> 
                    
                </div>
                <div class="infoParagraph addressSection">
                    To: <span class="accentColored addressText">{{assetTransferData.recipent}}</span> <span class="fonticon">&#xe177;</span>
                </div>
                <hr class="smallerHr">
                <div class="infoParagraph">
                    Fee: ~<span style="color: var(--accent_color)">{{txFee.toFixed(8)}}</span> <span style="font-size: 18px;">$<span class="accentColored">{{nativeAsset}}</span></span>  
                </div>
            </div>

            <div v-bind:class="currentTxState != txStates.NONE ? 'show' : 'hide' " class="outline txState">
                <div class="infoParagraph">
                    Status:
                    <span v-if="currentTxState == txStates.SENDING" style="color: var(--accent_color)">Sending<br></span>
                    <span v-if="currentTxState == txStates.PENDING" style="color: var(--accent_color)">Pending<br></span>
                    <span v-if="currentTxState == txStates.SUCCESS" style="color: #4dff97">Success <span class="fonticon" style="font-size: 18px;">&#xe876;</span><br></span>
                    <span v-if="currentTxState == txStates.FAILED"  style="color: #ff0061">Failed <span class="fonticon" style="font-size: 18px;">&#xe645;</span><br></span> 
                </div>

                <div class="infoParagraph">
                    Time: <span style="color: var(--accent_color);">{{txTimer.toFixed(2)}}s <br></span>
                </div>
                <hr>
                <div class="flexBox" style="align-items: center; justify-content: center;">
                    <div v-if="currentTxState == txStates.SENDING">
                        <div class="vultureLoader showLoader"></div>
                    </div>
                    <div v-if="currentTxState == txStates.PENDING">
                        <div class="vultureLoader showLoader"></div>
                    </div>
                </div>
                <div v-bind:class="currentTxState == txStates.SUCCESS ? 'showBlockId' : 'hideBlockId' " class="infoParagraph">
                    Block ID: <span style="color: var(--accent_color); font-size: 15px;">{{blockHash}}</span> <br>
                </div>
            </div>

        </div>
        <div class="flexBox" style="flex-grow: 0; margin-bottom: 15px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
            <DefaultButton  v-if="currentTxState == txStates.NONE" buttonHeight="40px" buttonWidth="150px" buttonText="Send" @button-click="send()"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue";
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import AccountModule from "../AccountModule.vue"

import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { VultureMessage } from '@/vulture_backend/vultureMessage';
import { TxState } from '@/types/uiTypes';
import { AbstractToken } from "@/vulture_backend/types/abstractToken";
import { DefaultNetworks } from "@/vulture_backend/types/networks/network";
import { ModalEventSystem, TransferAssetsData } from "@/modalEventSystem";

export default defineComponent({
  components: {
    DropdownSelection,
    AccountModule,
    DefaultButton,
    DefaultInput,
  },
  props: {
    modalSystem: {
        type: Object as PropType<ModalEventSystem>,
        required: true,
    },
    vultureWallet: {
        type: Object as PropType<VultureWallet>,
        required: true,
    },
  },
  setup(props, context) {

    let assetTransferData: TransferAssetsData = props.modalSystem.getModalData() as TransferAssetsData;

    let currentTxState = ref(TxState.NONE);
    let blockHash = ref('');
    let txTimer = ref(0);
    let txStates = TxState;

    const networks = new DefaultNetworks();

    let token: AbstractToken | null = null;

    let asset = ref('');
    let nativeAsset = ref('');
    nativeAsset.value = asset.value = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;
    // If we are sending a token, or native asset.
    if(assetTransferData.addressOfTokenToTransfer == "") {
        asset.value = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;
    }else {
        let tokenArray = props.vultureWallet.tokenStore.tokenList.get(props.vultureWallet.accountStore.currentlySelectedNetwork.networkUri);
        if(tokenArray != undefined) {
          if(tokenArray!.get(assetTransferData.addressOfTokenToTransfer!) != null) {
              asset.value = tokenArray!.get(assetTransferData.addressOfTokenToTransfer!)!.symbol;
              token = tokenArray!.get(assetTransferData.addressOfTokenToTransfer!)!;
          }else {
            console.error("Token not width address: " + assetTransferData.addressOfTokenToTransfer! + "found!");
            token = null;
            quitModal();
          }
        }
    }

    let accountAmount = ref(0);
    accountAmount.value = props.vultureWallet.accountStore.allAccounts.length;
    let selectedNetwork = reactive({network: networks.AlephZero});

    let txFee = ref(0);

    function quitModal() {
        currentTxState.value = TxState.NONE;
        props.modalSystem.closeModal();
    }

    function send() {
        currentTxState.value = TxState.SENDING;
        let timer = setInterval(async () => {
            txTimer.value += 0.01;
        }, 10);
        props.vultureWallet.currentWallet.accountEvents.removeAllListeners(VultureMessage.TRANSFER_ASSETS);
        props.vultureWallet.currentWallet.accountEvents.on(VultureMessage.TRANSFER_ASSETS, (params) => {
            if(params.status == false) {
                currentTxState.value = TxState.FAILED;
                blockHash.value = params.blockHash;
                clearInterval(timer);
            } else if(params.status == 'InBlock') {
                if(params.method == 'ExtrinsicSuccess') {
                    currentTxState.value = TxState.SUCCESS;
                    blockHash.value = params.blockHash;
                    clearInterval(timer);
                }else if(params.method == 'ExtrinsicFailed'){
                    currentTxState.value = TxState.FAILED;
                    blockHash.value = params.blockHash;
                    clearInterval(timer);
                }else {
                    currentTxState.value = TxState.FAILED;
                    blockHash.value = "Not included in block.";
                    clearInterval(timer);
                }
            }
            if(params.status == 'Ready') {
                currentTxState.value = TxState.SENDING;
            }
            if(params.status == 'Broadcast') {
                currentTxState.value = TxState.PENDING;
            }
        });

        props.vultureWallet.currentWallet.transferAssets(assetTransferData.recipent, Number(assetTransferData.amount), token == null ? undefined : token);
    }
    let estimateFee = () => {
        props.vultureWallet.estimateTxFee(
            assetTransferData.recipent,
            Number(assetTransferData.amount),
            token == null ? undefined : token
        ).then((fee) => {
            txFee.value = fee;
        });
    }
    estimateFee();

    return {
        txFee,
        asset,
        txTimer,
        networks,
        txStates,
        blockHash,
        nativeAsset,
        accountAmount,
        currentTxState,
        selectedNetwork,
        assetTransferData,

        quitModal: quitModal,
        send: send
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

hr {
    margin-top: 5px;
    margin-bottom: 5px;
    border: none;
    height: 1px;
    border-radius: 5px;
    width: 100%;
    background-color: var(--fg_color_2);
}
.smallerHr {
    background-color: var(--bg_color_2);
    height: 2px;
    width: 100%;
}
.fonticon {
    color: var(--fg_color_2);
    font-size: 20px;
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-style: solid;
    border-color: var(--bg_color_2);
    padding: 10px;
    box-sizing: border-box;
    border-radius: 12px;
    margin: 0px;

    width: 100%;
    
    overflow: hidden;
    overflow-y: auto;
}
.sectionTitleContainer {
    display: flex;
    width: 100%;
}
.addressSection {
    word-break: break-all;
}
.addressText {
    box-sizing: border-box;
    outline: none;
    font-size: 16px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.sectionDescription {
    box-sizing: border-box;
    font-size: 22px;
    margin-right: auto;
    margin-left: auto;
}
.infoIcon {
    font-family: fonticonA;
    font-size: 22px;
}
.infoParagraph {
    width: 100%;
    text-align: left;
    margin-bottom: 2px;
    font-size: 22px;
}
.txState {
    justify-content: flex-start;
    box-sizing: border-box;
    flex-wrap: wrap;
    text-align: left;
    border-radius: 12px;
    border-width: 2px;
    border-style: solid;
    border-color: var(--bg_color_2);
    margin: 12px;
    height: 181px;
    overflow: hidden;
}
.vultureLogo {
    fill: var(--bg_color);
    filter: drop-shadow(0px 0px 5px rgb(2,2,2));
}
.styled {
    color: var(--accent_color);
}
.box {
    flex-direction: column;
    background-color: var(--bg_color);
    box-shadow: 0px 0px 7px rgb(7, 7, 7);
    border-width: 2px;
    border-color: var(--bg_color_2);
    border-style: solid;
    border-radius: 24px;
    z-index: 2;
}

.hideBlockId {
    opacity: 0;
    transition-duration: 180ms;
}
.showBlockId {
    opacity: 1;
    transition-duration: 180ms;
}
</style>
