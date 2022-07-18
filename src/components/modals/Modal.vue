<template>
    <div class="flexBox box" style="position: absolute; height: 550px; width: 350px; top: 5px; left: 5px; overflow: hidden;">
        <CreateAccountModal v-if="currentModal == modalEvents.CREATE_NEW_ACCOUNT"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"
        :nextAccountIndex="vultureWallet.nextDerivIndex"/>

        <ModifyAccountModal v-if="currentModal == modalEvents.MODIFY_ACCOUNT"
        @quit-modal="quitModal()"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <SelectAccountModal v-if="currentModal == modalEvents.SELECT_ACCOUNT"
        @quit-modal="quitModal()" 
        :vultureWallet="vultureWallet"
        :modalSystem="modalSystem"
        :nextAccountIndex="vultureWallet.nextDerivIndex"/>

        <SelectNetworkModal v-if="currentModal == modalEvents.SELECT_NETWORK"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <TransferAssetsModal v-if="currentModal == modalEvents.TRANSFER_ASSETS"
        :vultureWallet="vultureWallet"
        :modalSystem="modalSystem"/>

        <ResetWalletModal v-if="currentModal == modalEvents.RESET_WALLET"
        @on-wallet-reset="hardWalletReset()"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <AddTokenModal v-if="currentModal == modalEvents.ADD_TOKEN"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <TokenViewModal v-if="currentModal == modalEvents.VIEW_TOKEN_INFO"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <SelectAssetModal v-if="currentModal == modalEvents.SELECT_ASSET"
        @select-token="selectToken($event)"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"
        :selectedTokenAddress="addressOfTokenToTransfer"/>

        <TransferBetweenStaking v-if="currentModal == modalEvents.TRANSFER_BETWEEN_STAKING_ACCOUNT"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>

        <StakeFundsModal v-if="currentModal == modalEvents.BOND_FUNDS"
        :modalSystem="modalSystem"
        :vultureWallet="vultureWallet"/>
        
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import TokenViewModal from './TokenViewModal.vue';
import StakeFundsModal from './StakeFundsModal.vue';
import ResetWalletModal from './ResetWalletModal.vue';
import CreateAccountModal from './CreateAccountModal.vue';
import ModifyAccountModal from './ModifyAccountModal.vue';
import SelectAccountModal from './SelectAccountModal.vue';
import SelectNetworkModal from './SelectNetworkModal.vue';
import TransferBetweenStaking from './TransferBetweenStaking.vue';
import TransferAssetsModal from './TransferAssetsModal.vue';
import SelectAssetModal from './SelectAssetModal.vue';

import AddTokenModal from "./AddTokenModal.vue"

import { Modals } from "../../types/uiTypes";
import { defineComponent, PropType } from "@vue/runtime-core";
import { VultureWallet } from "../../vulture_backend/wallets/vultureWallet";
import { AddTokenData, ModalEvents, ModalEventSystem } from "@/modalEventSystem";
import { reactive, ref } from "vue";


export default defineComponent({
  name: "Modal",
  components: {
    DefaultButton,
    ResetWalletModal,
    TransferBetweenStaking,
    ModifyAccountModal,
    CreateAccountModal,
    SelectAccountModal,
    SelectNetworkModal,
    TransferAssetsModal,
    SelectAssetModal,
    StakeFundsModal,
    TokenViewModal,
    AddTokenModal,
  },
  props: {
      modalSystem: {
          type: Object as PropType<ModalEventSystem>,
          required: true,
      },
      currentModal: {
          type: String as PropType<ModalEvents>,
          required: true,
      },
      vultureWallet: {
          type: Object as PropType<VultureWallet>,
          required: true,
      },
      selectedAccountIndex: Number,

      recipentAddress: String,
      amountToSend: String,

      tokenTypeToAdd: String,
      addressOfTokenToView: String,
      addressOfTokenToTransfer: String
  },
  setup(props, context) {
    let modals = Modals;

    let modalEvents = ModalEvents;

    function quitModal() {
        context.emit("quit-modal");
    }
    function selectToken(tokenAddress: string) {
        context.emit("select-token", tokenAddress);
    }
    function hardWalletReset() {
        context.emit("on-wallet-reset");
    }
    function resetSelectedToken() {
        context.emit("reset-selected-token");
    }

    return {
        // new modal system
        modalEvents,

        // deprecated, remove when done.
        modals,
        
        quitModal: quitModal,
        hardWalletReset: hardWalletReset,
        resetSelectedToken: resetSelectedToken,
        selectToken: selectToken,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vultureLogo {
    fill: var(--bg_color);
    filter: drop-shadow(0px 0px 5px rgb(2,2,2));
}
.styled {
    color: var(--accent_color);
}
.welcomeText {
    font-size: 16px;
    text-align: center;
}
.box {
    flex-direction: column;
    background-color: var(--bg_color);
    box-shadow: 0px 0px 7px rgb(7, 7, 7);
    border-width: 2px;
    border-color: var(--bg_color_2);
    border-style: solid;
    border-radius: 12px;
    z-index: 2;
}
</style>
