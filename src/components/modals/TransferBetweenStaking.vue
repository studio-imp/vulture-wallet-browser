<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">

                <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    Transfer Between
                    </div>
                    <div style="font-size: 24px; margin-left: 5px; margin-top: 3px;" class="fonticon">
                        &#xea18;
                    </div>
                </div>
                <hr style="width: 100%;">

                <div class="infoSection" style="margin-bottom: auto; margin-top: 20px;">
                    <div class="infoParagraph addressSection">
                        Deposit Address: <span class="accentColored addressText"> {{vultureWallet.currentWallet.accountData.address.slice(0,10) + '...'}}</span>
                    </div>
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored"> {{Math.round(Number(accountBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span style="font-size: 14px;" class="accentColored">{{asset}}</span>
                    </div>
                </div>


                <div class="transferArrow"
                :class="[transferToStakingAccount == true ? 'stakingDirection' : '',
                 statusCode == 'verifyTransfer' ? 'blinkAccent' : '', statusCode == 'Sent' ? 'accentColored' : '']">
                    &#xe5d8;
                </div>
                                                <!-- Will do computed later, on refactor stage. -->
                <div class="temporary" :class="[statusCode != 'verifyTransfer' ? 'showAmountBox'  : '',
                                                statusCode == 'verifyTransfer' ? 'showConfirmBox' : '',
                                                statusCode == 'Sent'           ? 'showTxDataBox'  : '']">

                    <div class="transferBetweenBox">
                        <div class="flexBox" style="flex-direction: row; align-items: center; justify-content: space-evenly; width: 100%;">
                            <div class="directionButton" :class="transferToStakingAccount == true ? 'stakingDirection' : ''" @click="switchTransferDirection()">
                                &#xe5d8;
                            </div>
                            <div style="margin-top: 10px;">
                                <MinimalInput style="margin-bottom: 5px;"
                                @on-enter="amount($event)" inputPlaceholder="0" inputType="number" inputWidth="175px" inputHeight="38px" fontSize="20px" inputName="Amount"/>
                                 <div class="amountStatusText" :class="statusCode == 'InsufficientFunds' ? 'showSection' : 'hideSection'">
                                         Insufficient Funds
                                 </div>
                            </div>
                        </div>
                    </div>

                    <div class="transferBetweenBox">
                        <div class="flexBox" style="flex-direction: row; align-items: center; justify-content: center; width: auto;">
                            <div class="circle">
                                {{amountToTransfer}} <span style="font-size: 15px;">&nbsp;{{asset}}</span>
                            </div>
                            <span style="font-size: 20px;">+</span>
                            <div class="circle" style="overflow-x: scroll-x;">
                                {{Math.round(Number(txFee) *  Math.pow(10, 5)) / Math.pow(10, 5)}} &nbsp; <span style="font-size: 15px;">(tx fee)</span>
                            </div>
                        </div>
                        <hr class="smallerHr">
                        <div class="amountStatusText" v-if="transferToStakingAccount == false">Send To Deposit address <br> Please Confirm</div>
                        <div class="amountStatusText" v-if="transferToStakingAccount == true">Send to Staking address <br> Please Confirm</div>
                    </div>

                    <div class="transferBetweenBox">
                         <div class="infoParagraph">
                            Status:
                            <span v-if="currentTxState == txStates.SENDING" style="color: var(--accent_color)">Sending<br></span>
                            <span v-if="currentTxState == txStates.PENDING" style="color: var(--accent_color)">Pending<br></span>
                            <span v-if="currentTxState == txStates.SUCCESS" style="color: #4dff97">Success<br></span>
                            <span v-if="currentTxState == txStates.FAILED"  style="color: #ff0061">Failed<br></span> 
                        </div>


                        <div class="infoParagraph">
                            Time: <span style="color: var(--accent_color);">{{txTimer.toFixed(2)}}s <br></span>
                        </div>
                        <div class="infoParagraph" v-if="currentTxState == txStates.SUCCESS">
                            Sent: <span class="accentColored">{{amountToTransfer}}<span style="font-size: 15px;">&nbsp;{{asset}}</span></span> 
                        </div>

                    </div>

                </div>


                <div class="transferArrow"
                :class="[transferToStakingAccount == true ? 'stakingDirection' : '',
                 statusCode == 'verifyTransfer' ? 'blinkAccent' : '', statusCode == 'Sent' ? 'accentColored' : '']">
                    &#xe5d8;
                </div>

                <div class="infoSection" style="margin-top: auto; margin-bottom: 10px;">
                    <div class="infoParagraph addressSection">
                        Staking Address: <span class="accentColored addressText"> {{stakingAddress.slice(0,10) + '...'}}</span>
                    </div>
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored"> {{Math.round(Number(stakingAddressBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span style="font-size: 14px;" class="accentColored">{{asset}}</span>
                    </div>
                </div>

            </div>

        </div>


        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"
            v-if="statusCode != 'verifyTransfer' && statusCode != 'Sending' && statusCode != 'Sent'"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Back" @button-click="verifyTransferToggle()"
            v-if="statusCode == 'verifyTransfer'"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Confirm" @button-click="sendTransaction()"
            v-if="statusCode == 'verifyTransfer'"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Next" @button-click="verifyTransferToggle()"
             :buttonDisabled="statusCode == 'readyToTransfer' ? false : true"
             v-if="statusCode != 'verifyTransfer' && statusCode != 'Sending' && statusCode != 'Sent'"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"
            v-if="statusCode == 'Sending' || statusCode == 'Sent'"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Stake" @button-click="stake()"
            v-if="statusCode == 'Sent' && currentTxState == txStates.SUCCESS"/>

        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { ModalEvents, ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { NetworkFeatures, NetworkType } from "@/vulture_backend/types/networks/networkTypes";
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { StakingInfo, SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";
import { TxState } from "@/types/uiTypes";

export default defineComponent({
  name: "TransferBetweenStaking",
  components: {
    DropdownSelection,
    DefaultButton,
    MinimalInput,
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

    let stakingSupport = ref(props.vultureWallet.supportsFeature(NetworkFeatures.STAKING));
    let stakingAddress = ref('');
    let stakingAddressBalance = ref('');

    let statusCode = ref('');

    let accountBalance = ref(props.vultureWallet.currentWallet.accountData.freeAmountWhole);

    let amountToTransfer = ref(0);
    let txFee = ref(0);

    let transferToStakingAccount = ref(true);

    let asset = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;

    let currentTxState = ref(TxState.NONE);
    let blockHash = ref('');
    let txTimer = ref(0);
    let txStates = TxState;

    if(stakingSupport.value == true) {
        stakingAddress.value = props.vultureWallet.currentWallet.accountData.stakingAddress!;

        if(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType == NetworkType.Substrate) {
            let stakingData = props.vultureWallet.currentWallet.accountData.stakingInfo.get(StakingInfo.Substrate) as SubstrateStakingInfo;  
            stakingAddressBalance.value = stakingData.liquidBalance;
        }

    }else {
        console.warn("The currently selected network doesn't support staking!");
    }

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function sendTransaction() {
        currentTxState.value = TxState.SENDING;
        statusCode.value = "Sending";
        let timer = setInterval(async () => {
            txTimer.value += 0.01;
        }, 10);
        props.vultureWallet.currentWallet.accountEvents.removeAllListeners(VultureMessage.TRANSFER_ASSETS);
        props.vultureWallet.currentWallet.accountEvents.on(VultureMessage.TRANSFER_ASSETS, (params) => {
            if(params.success == false) {
                currentTxState.value = TxState.FAILED;
                blockHash.value = params.blockHash;
                clearInterval(timer);
            } else if(params.status == 'InBlock') {
                if(params.method == 'ExtrinsicSuccess') {
                    currentTxState.value = TxState.SUCCESS;
                    blockHash.value = params.blockHash;
                    clearInterval(timer);

                    if(transferToStakingAccount.value == false) {
                        // fking stupid but im lazy right now I haven't slept in ages >_>, no harm in doing it this way
                        // for now.
                        stakingAddressBalance.value = String(Number(stakingAddressBalance.value) - Number(amountToTransfer.value));
                        accountBalance.value += Number(amountToTransfer.value);
                    }else {
                        accountBalance.value -= Number(amountToTransfer.value);
                        // Again, I'm too lazy to just turn stakingAddressBalance into a Number by default. Next update
                        // is refactoring update...
                        stakingAddressBalance.value = String(Number(stakingAddressBalance.value) + Number(amountToTransfer.value));
                    }
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

        let from: {address: string, derivationPath: string} | undefined = undefined;
        let recipent = stakingAddress.value;
        if(transferToStakingAccount.value == false) {
            recipent = props.vultureWallet.currentWallet.accountData.address;
            from = {
                address: stakingAddress.value,
                derivationPath: "//staking_" + props.vultureWallet.currentWallet.accountData.accountIndex
            };
        }
        statusCode.value = 'Sent';
        props.vultureWallet.currentWallet.transferAssets(recipent, Number(amountToTransfer.value), undefined, from);
    }
    function verifyTransferToggle() {
        if(statusCode.value == 'readyToTransfer') {
            statusCode.value = 'verifyTransfer';
        }else {
            statusCode.value = 'readyToTransfer';
        }
        //statusCode.value == 'verifyTransfer' ? 'readyToTransfer' : 'verifyTransfer';
    }
    amount('0');
    function amount(value: string) {
        // If we change the amount 
        //if(statusCode.value == 'verifyTransfer') {
        //    statusCode.value = '';
        //}

        amountToTransfer.value = Number(value);
        if(amountToTransfer.value > 0) {
            if(transferToStakingAccount.value == true) {
                props.vultureWallet.estimateTxFee(stakingAddress.value, amountToTransfer.value).then((fee) => {
                    txFee.value = Number(fee);
                    if(accountBalance.value < amountToTransfer.value + fee) {
                        statusCode.value = 'InsufficientFunds';
                    }else {
                        statusCode.value = 'readyToTransfer';
                    }
                });
    
            }else {
                props.vultureWallet.estimateTxFee(stakingAddress.value, amountToTransfer.value).then((fee) => {
                    txFee.value = Number(fee);
                    if(Number(stakingAddressBalance.value) < amountToTransfer.value + fee) {
                        statusCode.value = 'InsufficientFunds';
                    }else {
                        statusCode.value = 'readyToTransfer';
                    }
                });
            }
        }else {
            statusCode.value = '';
            return;
        }
    }
    function switchTransferDirection() {
        transferToStakingAccount.value = !transferToStakingAccount.value;
        amount(String(amountToTransfer.value));
    }
    function stake() {
        props.modalSystem.openModal(ModalEvents.BOND_FUNDS, null);
    }
    return {
        transferToStakingAccount,
        stakingAddressBalance,
        amountToTransfer,
        accountBalance,
        stakingAddress,
        statusCode,
        asset,
        txFee,

        currentTxState,
        blockHash,
        txStates,
        txTimer,

        stake: stake,
        amount: amount,
        quitModal: quitModal,
        sendTransaction: sendTransaction,
        verifyTransferToggle: verifyTransferToggle,
        switchTransferDirection: switchTransferDirection,
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
    background-color: var(--fg_color_2);
}
.fonticon {
    color: var(--fg_color_2);
}
.smallerHr {
    background-color: var(--bg_color_2);
    height: 2px;
    border-radius: 10px;
    width: 90%;
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-style: none;
    border-bottom-style: solid;
    border-color: var(--bg_color_2);
    padding: 15px;
    box-sizing: border-box;
    margin: 0px;


    min-height: 475px;
    max-height: 475px;

    width: 100%;
    
    overflow: hidden;
    overflow-y: auto;

    border-radius: 0px;
}
.amountStatusText {
    font-size: 16px;
    color: var(--fg_color_2);
}
.infoSection {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    align-items: center;
    margin: 8px;
    margin-left: 5px;
    margin-right: 5px;
    padding: 10px;
    outline: solid;
    outline-width: 1px;
    border-radius: 4px;
    outline-color: var(--bg_color_2);

    width: 100%;
}
.sectionTitleContainer {
    display: flex;
    width: 100%;
}
.sectionDescription {
    font-size: 22px;
    margin-right: auto;
    margin-left: auto;
}

.temporary {
    display: flex;
    
    flex-direction: row;
    margin: 0px;
    width: auto;
    padding: 1px;
    overflow: hidden;
    flex-wrap: nowrap;
    box-sizing: border-box;
    flex-direction: row;
    margin-bottom: auto;
    margin-top: auto;

    transition-duration: 150ms;
}

.infoParagraph {
    width: 100%;
    text-align: left;
    font-size: 22px;
}
.addressSection {
    word-break: break-all;
}
.addressText {
    box-sizing: border-box;
    outline: none;
    font-size: 20px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.transferBetweenBox {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    min-width: 316px;
    max-width: 316px;
    margin-left: 50px;
    margin-right: 50px;
    
    padding: 5px;

    outline-style: solid;
    outline-width: 1px;
    outline-color: var(--bg_color_2);

    margin-bottom: auto;
    margin-top: auto;

    transition-duration: 120ms;

    border-radius: 4px;
}
.transferArrow {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    font-family: fonticonA;
    width: 20px;
    height: 20px;
    margin: 5px;
    color: var(--bg_color_2);
    user-select: none;
    transition-duration: 125ms;
}
.directionButton {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 38px;
    font-family: fonticonA;
    width: 48px;
    height: 48px;
    margin-top: 5px;
    outline-style: solid;
    border-radius: 50px;
    outline-width: 2px;
    color: var(--fg_color_2);
    user-select: none;
    transition-duration: 125ms;
    cursor: pointer;
}
.directionButton:hover {
    color: var(--accent_color);
    transition-duration: 170ms;
}
.directionButton:active {
    filter: brightness(75%);
    transition-duration: 125ms;
}
.circle {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    max-width: 115px;
    width: auto;
    height: 30px;
    max-height: 30px;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 10px;
    outline-style: solid;
    border-radius: 10px;
    outline-width: 2px;
    outline-color: var(--bg_color_2);
    color: var(--accent_color);

    white-space: nowrap;

    overflow-y: hidden;
    overflow-x: scroll;
}
.stakingDirection {
    transform: rotate(180deg);
    transition-duration: 160ms;
}
.hideDisplay {
    display: none;
}

.blinkAccent {
    animation: blink 1s infinite;
}
.accentColored {
    color: var(--accent_color);
}
@keyframes blink {
    0% {
        color: var(--bg_color_2);
    }
    50% {
        color: var(--accent_color);
    }
    100% {
        color: var(--bg_color_2);
    }
}

/* -- There are 3 boxes, we divide the width + margin to get the offset, for the slide transitions -- */
.showAmountBox {
    margin-left: 832px;
    transition-duration: 180ms;
    filter: opacity(1);
}
.showConfirmBox {
    margin-left: 0px;
    transition-duration: 180ms;
    filter: opacity(1);
}
.showTxDataBox {
    margin-left: -832px;
    filter: opacity(1);
    transition-duration: 180ms;
}
/* ^ There are 3 boxes, we divide the width + margin to get the offset, for the slide transitions ^ */


.showSection {
  transition-duration: 180ms;
  filter: opacity(1);
}
.hideSection {
  transition-duration: 140ms;
  filter: opacity(0);
}

*::-webkit-scrollbar {
    width: 3px;        
    height: 3px;
    display: none;
}
*::-webkit-scrollbar-track {
    box-shadow: 0px 0px 0px rgba(0,0,0,1);
    background: rgb(16,16,16);
    border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
    background-color: var(--bg_color_2);
    border-radius: 10px;
}

</style>
