<template>

    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="display: flex; width: 100%; margin-bottom: 5px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    Rewards &amp; Payouts
                    </div>
                </div>
                <hr style="width: 100%; height: 1px; margin-bottom: 15px;">

                <div class="vultureLoader" v-if="isLoading == true"></div>

                <div class="unlockingFundsBox" v-if="unlockingEras.length <= 0">
                    You have no pending payouts.
                    <div class="fonticon" style="margin-top: 10px;">
                        &#xe87d;
                    </div>
                </div>
                <TransitionGroup>
                <!-- Will make a seperate component for this later, cleanup stage tings. -->
                <div class="unlockingFundsBox"  v-for="(unlock, index) in unlockingEras" :key="(unlock, index)">
                    <div class="boxTitle">
                        <div class="fonticon">
                            &#xef57;
                        </div>
                        Scheduled Unstake <!-- :&nbsp; <span class="accentColored">{{index}}</span>  this looks kinda ugly tbh-->
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Amount (<span class="asset">${{asset}}</span>):
                        </div>
                        <div class="value">
                            {{Math.round(Number(unlock.balanceToUnlock) *  Math.pow(10, 4)) / Math.pow(10, 4)}}
                        </div>
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Unlocks in Era:
                        </div>
                        <div class="value">
                            {{unlock.eraOfUnlock}}
                        </div>
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Current Era:
                        </div>
                        <div class="value">
                            {{currentEra}}
                        </div>
                    </div>
                    <div class="valueBox" v-if="unlock.isUnlockable == true">
                        <div class="value accentColored"
                        style="width: 100%;  border-top-style: solid;border-bottom-style: none; padding-top: 10px; margin-top: 2px;">
                            Unlock by pressing 'Withdraw'
                        </div>
                    </div>
                </div>

                <!-- Will make a seperate component for this later, cleanup stage tings. -->
                <div class="unlockingFundsBox" v-if="statusCode == 'Sent'">
                    <div class="boxTitle">
                        <div class="fonticon">
                            &#xef6e;
                        </div>
                        Withdraw Status
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Status:
                        </div>
                        <div class="value">
                            <span v-if="currentTxState == txStates.SENDING" style="color: var(--accent_color)">Sending<br></span>
                            <span v-if="currentTxState == txStates.PENDING" style="color: var(--accent_color)">Pending<br></span>
                            <span v-if="currentTxState == txStates.SUCCESS" style="color: #4dff97">Success <br></span>
                            <span v-if="currentTxState == txStates.FAILED"  style="color: #ff0061">Failed <br></span> 
                        </div>
                    </div>

                    <div class="valueBox">
                        <div class="valueTitle">
                            Time:
                        </div>
                        <div class="value">
                            <span style="color: var(--accent_color);">{{txTimer.toFixed(2)}}s <br></span>
                        </div>
                    </div>

                    <div class="valueBox" v-if="currentTxState == txStates.SUCCESS">
                        <div class="valueTitle">
                            Block ID:
                        </div>
                        <div class="addressValue">
                            {{blockHash}}
                        </div>
                    </div>
                </div>
                </TransitionGroup>

            </div>
        </div>
        

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Withdraw" @button-click="withdrawPayouts()" v-if="hasUnlockableUnbonds == true"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, Ref, ref } from 'vue';
import { ModalEvents, ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";
import BigNumber from "bignumber.js";
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { TxState } from "@/types/uiTypes";

export default defineComponent({
  name: "PayoutsModal",
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

    let modal = ModalEvents;
    
    let isLoading = ref(true);

    let stakingInfo: SubstrateStakingInfo | null = null;
    let unlockingEras: Ref<any> = ref([]);

    let currentEra = ref(0);
    let asset: string = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;

    let hasUnlockableUnbonds = ref(false);

    updateStakingInfo();
    function updateStakingInfo() {
        unlockingEras.value = [];
        props.vultureWallet.getStakingInfo().then((data) => {
            stakingInfo = data.params.stakingInfo as SubstrateStakingInfo;
            currentEra.value = Number(stakingInfo.currentEra);
            //currentEra.value = 101; For testing withdraw
            for(let i = 0; i < stakingInfo.unlocking.length; i++) {
                let e = {
                    eraOfUnlock: Number(stakingInfo.unlocking[i].eraOfUnlock),
                    balanceToUnlock: new BigNumber(stakingInfo.unlocking[i].balanceToUnlock)
                                        .div(new BigNumber(10)
                                        .pow(props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetDecimals))
                                        .toString(),
                    isUnlockable: false
                }
                // Shows the withdraw buttons
                if(e.eraOfUnlock <= currentEra.value) {
                    e.isUnlockable = true;
                    hasUnlockableUnbonds.value = true;
                }
                unlockingEras.value.push(e);
            }
            isLoading.value = false;
        });
    }


    function quitModal() {
        props.modalSystem.closeModal();
    }


    let currentTxState = ref(TxState.NONE);
    let blockHash = ref('');
    let txStates = TxState;

    let txTimer = ref(0);

    let statusCode = ref('');

    function withdrawPayouts(){
        let timer = setInterval(async () => {
            txTimer.value += 0.01;
        }, 10);

        currentTxState.value = TxState.SENDING;
        props.vultureWallet.currentWallet.accountEvents.removeAllListeners(VultureMessage.WITHDRAW_ALL_PAYOUTS);
        props.vultureWallet.currentWallet.accountEvents.on(VultureMessage.WITHDRAW_ALL_PAYOUTS, (params) => {
            if(params.success == false) {
                currentTxState.value = TxState.FAILED;
                blockHash.value = params.blockHash;
                clearInterval(timer);
            } else if(params.status == 'InBlock') {
                if(params.method == 'ExtrinsicSuccess') {
                    currentTxState.value = TxState.SUCCESS;
                    blockHash.value = params.blockHash;
                    hasUnlockableUnbonds.value = false;
                    updateStakingInfo();
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
        statusCode.value = 'Sent';
        props.vultureWallet.currentWallet.withdrawAllPayouts();
    }
    return {
        modal,
        asset,
        isLoading,
        currentEra,
        stakingInfo,
        unlockingEras,
        hasUnlockableUnbonds,
        
        currentTxState,
        statusCode,
        blockHash,
        txStates,
        txTimer,

        withdrawPayouts: withdrawPayouts,
        quitModal: quitModal
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
.boxTitle {
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
    width: 100%;
    align-items: center;
    text-align: center;
    font-size: 22px;
    border-bottom-style: solid;
    border-width: 1px;
    padding-bottom: 5px;
    border-color: var(--bg_color_2);
    margin-bottom: 5px;
}
.asset {
    font-size: 14px;
    color: var(--fg_color_2);
}
.valueBox {
    display: flex;
    box-sizing: border-box;
    margin: 2px;
    justify-content: space-between;
}
.value {
    font-size: 18px;
    border-bottom-style: solid;
    border-width: 1px;
    border-color: var(--bg_color_2);
}
.addressValue {    
    display: flex;
    flex-grow: 0;
    flex-direction: row;
    word-break: break-all;
    color: var(--accent_color);
    font-size: 14px;
    width: 70%;

    border-bottom-style: solid;
    border-width: 1px;
    border-color: var(--bg_color_2);
}
.valueTitle {
    font-size: 18px;
    color: var(--fg_color_2);
}
.unlockingFundsBox {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-style: solid;
    border-width: 1px;
    padding: 10px;
    border-color: var(--bg_color_2);
    border-radius: 10px;
    width: 95%;
    height: fit-content;

    margin-bottom: 10px;
}
.fonticon {
    color: var(--fg_color_2);
    margin-right: 5px;
    font-size: 25px;
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-style: none;
    border-bottom-style: solid;
    border-color: var(--bg_color_2);
    padding: 10px;
    box-sizing: border-box;
    margin: 0px;


    min-height: 475px;
    max-height: 475px;

    width: 100%;
    
    overflow: hidden;
    overflow-y: auto;

    border-radius: 0px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 220ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
