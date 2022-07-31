<template>

    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    Stake Menu 🥩
                    </div>
                </div>
                <hr style="width: 100%; margin-bottom: 15px;">
                <div class="buttonRow">
                    <div class="stakeButton">
                        Payouts &amp; Rewards
                    </div>
                </div>
                <div class="buttonRow">
                    <div class="stakeButton" @click="openModal(modal.TRANSFER_BETWEEN_STAKING_ACCOUNT)">
                        Transfer Between
                    </div>
                </div>
                <div class="buttonRow">
                    <div class="stakeButton" @click="openModal(modal.BOND_FUNDS)"> 
                        Stake
                    </div>
                    <div class="stakeButton" @click="openModal(modal.UNBOND)">
                        Unstake
                    </div>
                    <div class="stakeButton" @click="openModal(modal.NOMINATE_VALIDATOR)">
                        Nominate
                    </div>
                </div>
            </div>

        </div>

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
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

export default defineComponent({
  name: "StakeMenuModal",
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

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function openModal(modal: ModalEvents) {
        props.modalSystem.openModal(modal, null);
    }
    return {
        modal,

        openModal: openModal,
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
.buttonRow {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;

    width: 100%;
}
.stakeButton {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin: 5px;
    width: 100%;
    height:  86px;
    border-style: solid;
    border-width: 2px;
    border-radius: 10px;
    padding: 10px;
    border-color: var(--bg_color_2);
    box-shadow: 0px 0px 9px rgba(0,0,0,0.45);
    cursor: pointer;
    transition-duration: 150ms;
    user-select: none;
}
.stakeButton:hover {
    transition-duration: 150ms;
    border-color: var(--accent_color);

}
.stakeButton:active {
    filter: brightness(50%);
    transition-duration: 100ms;
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
</style>
