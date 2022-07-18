<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="width: 100%;">
                    <div style="font-size: 26px;">
                        Staking
                    </div>
                    <hr>
                </div>

                <div class="infoSection" style="margin-top: auto; margin-bottom: auto;" v-if="statusCode == 'StakingInfo'">
                    <div style="width: 100%; margin-bottom: 5px;">
                        <div style="font-size: 24px;">
                            Staking Info
                        </div>
                        <hr>
                    </div>
                    <div class="infoParagraph" style="font-size: 20px;">
                        Minimum stake amount on <span class="accentColored">{{currentNetwork}}</span> is
                        <span class="accentColored">{{minimumStakingAmount}}</span>.
                        <hr class="seperatorHr">
                        You will need to fund the <span class="accentColored">staking address</span> to stake.
                        <hr class="seperatorHr">
                        The staking address <span class="accentColored">and</span> the Deposit address may need extra funds to cover transaction fees.
                        <hr class="seperatorHr">
                        Feel free to read our <a href="https://docs.vulturewallet.net/staking" target="_blank">Staking Guide</a>.
                        <span class="accentColored">Proceed?</span>
                    </div>
                </div>

                <div class="infoSection" style="margin-top: 10px; margin-auto: 10px;" v-if="statusCode == 'BondExtra' || statusCode == 'Bond'">
                    <div class="infoParagraph addressSection">
                        Staking Address: <span class="accentColored addressText"> {{stakingAddress}}</span>
                    </div>
                    <hr class="smallerHr">
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored"> {{Math.round(Number(stakingAddressBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span style="font-size: 14px;" class="accentColored">{{asset}}</span>
                    </div>
                </div>

            </div>

        </div>


        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Proceed" @button-click="setCode('Bond')" v-if="statusCode == 'StakingInfo'"/>

        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { NetworkFeatures, NetworkType } from "@/vulture_backend/types/networks/networkTypes";
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { StakingInfo, SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";
import { TxState } from "@/types/uiTypes";

export default defineComponent({
  name: "StakeFundsModal",
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

    let minimumStakingAmount = ref(0);

    let currentNetwork = props.vultureWallet.accountStore.currentlySelectedNetwork.networkName;

    let isBonded = ref(false);

    let statusCode = ref('StakingInfo');

    let accountBalance = ref(props.vultureWallet.currentWallet.accountData.freeAmountWhole);

    let amountToStake = ref(0);
    let txFee = ref(0);

    let transferToStakingAccount = ref(true);

    let asset = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;

    let currentTxState = ref(TxState.NONE);
    let blockHash = ref('');
    let txStates = TxState;

    if(stakingSupport.value == true) {
        stakingAddress.value = props.vultureWallet.currentWallet.accountData.stakingAddress!;

        if(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType == NetworkType.Substrate) {
            let stakingData = props.vultureWallet.currentWallet.accountData.stakingInfo.get(StakingInfo.Substrate) as SubstrateStakingInfo;  
            stakingAddressBalance.value = stakingData.liquidBalance;
            minimumStakingAmount.value = Number(stakingData.minimumBondAmount);
            isBonded.value = stakingData.isStashAccountBonded;

            if(isBonded.value == true) {
                statusCode.value = 'BondExtra';
            }
        }

    }else {
        console.warn("The currently selected network doesn't support staking!");
    }

    function quitModal() {
        props.modalSystem.closeModal();
    }
    amount('0');
    function amount(value: string) {
        amountToStake.value = Number(value);
    }

    function setCode(code: string) {
        statusCode.value = code;
    }

    return {
        transferToStakingAccount,
        stakingAddressBalance,
        minimumStakingAmount,
        accountBalance,
        currentNetwork,
        stakingAddress,
        statusCode,
        asset,
        txFee,
        

        currentTxState,
        blockHash,
        txStates,

        amount: amount,
        setCode: setCode,
        quitModal: quitModal,
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
.smallerHr {
    background-color: var(--bg_color_2);
    height: 1px;
    border-radius: 10px;
    width: 100%;
}
.seperatorHr {
    width: 100%;
    background-color: var(--bg_color_2);
    height: 1px;
    margin-bottom: 5px;
    margin-top: 5px;
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
    margin: 0px;
    width: 100%;
    box-sizing: border-box;
    padding: 0px;
    flex-direction: row;
    margin-bottom: auto;
    margin-top: auto;

    transition-duration: 150ms;
}
.infoIcon {
    font-family: fonticonA;
    font-size: 22px;
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
    font-size: 16px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.description {
    font-size: 16px;
}

.transferBetweenBox {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    
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
    overflow-x: auto;
}
.stakingDirection {
    transform: rotate(180deg);
    transition-duration: 160ms;
}
.description {
    color: var(--fg_color_2);
    font-size: 15px;
    width: 80%;
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
