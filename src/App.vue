<template>
  <span
    :style="[
      '--accent_color: ' + currentAccentColor,
      '--gradient_1:' + gradientColor1,
      '--gradient_2:' + gradientColor2,
    ]"
  >
    <div v-if="walletState == state.WALLET">
      <OverviewModule
        v-if="vultureWallet.accountStore != null"
        :address="address"
        :assetPrefix="assetPrefix"
        :assetAmount="assetAmount"
        :accountName="vultureWallet.currentWallet.accountData.accountName"
        :isWalletReady="vultureWallet.currentWallet.isReady"
        :modalSystem="modalSystem"
      />

      <Navbar @switch-tab="setTab($event)" />

      <SendTab
        v-if="vultureWallet.accountStore != null"
        style="position: absolute; width: 360px"
        v-bind:class="currentTab == 'send' ? 'show' : 'hide'"
        @send-button-click="transferAssets($event)"
        :addressOfTokenToTransfer="addressOfTokenToTransfer"
        :vultureWallet="vultureWallet"
        :modalSystem="modalSystem"
      />

      <WalletTab
        v-if="vultureWallet.accountStore != null"
        style="position: absolute; width: 360px"
        v-bind:class="currentTab == 'wallet' ? 'show' : 'hide'"
        :vultureWallet="vultureWallet"
        :isWalletReady="vultureWallet.currentWallet.isReady"
        :modalSystem="modalSystem"
      />

      <AccountsTab
        v-if="vultureWallet.accountStore != null"
        v-bind:class="currentTab == 'accounts' ? 'show' : 'hide'"
        style="position: absolute; width: 360px; height: 345px"
        :allAccounts="vultureWallet.accountStore.allAccounts"
        :vultureWallet="vultureWallet"
        :modalSystem="modalSystem"
      />

      <SettingsTab
        v-bind:class="currentTab == 'settings' ? 'show' : 'hide'"
        style="position: absolute; width: 360px; height: 345px"
        :vultureWallet="vultureWallet"
        :modalSystem="modalSystem"
        @reset-wallet="resetWallet()"
      />

      <!-- I know, this is pretty fking stupid because it's so confusing, but until the new modal-system is added this will
  have to do (v0.1.7 - v0.1.8 era will introduce a new modal system.) -->

      <Modal
        v-bind:class="currentModal == modals.NONE ? 'hide' : 'show'"
        :vultureWallet="vultureWallet"
        :selectedAccountIndex="selectedAccountIndex"
        :tokenTypeToAdd="tokenTypeToAdd"
        :modalSystem="modalSystem"
        :currentModal="currentModal"
        :addressOfTokenToView="addressOfTokenToView"
        :addressOfTokenToTransfer="addressOfTokenToTransfer"
        @on-wallet-reset="onWalletReset()"
        @select-token="selectToken($event)"
        @reset-selected-token="resetSelectedToken()"
      />
    </div>

    <div v-if="walletState == state.PASSWORD_LOCKED">
      <UnlockWallet
        @decrypted-vault="initWallet($event)"
        :encryptedVault="vault"
      />
    </div>

    <div v-if="walletState == state.ONBOARDING">
      <Onboarding style="position: absolute; width: 360px" />
    </div>
  </span>
</template>

<script lang="ts">
import OverviewModule from "./components/OverviewModule.vue";
import DefaultButton from "./components/building_parts/DefaultButton.vue";
import UnlockWallet from "./components/UnlockWallet.vue";
import AccountsTab from "./components/AccountsTab.vue";
import SettingsTab from "./components/SettingsTab.vue";
import Onboarding from "./components/Onboarding.vue";
import WalletTab from "./components/WalletTab.vue";
import SendTab from "./components/SendTab.vue";
import Navbar from "./components/Navbar.vue";
import Modal from "./components/modals/Modal.vue";

import { provide } from "vue";

import {
  doesWalletExist,
  VultureWallet,
  loadVault,
  Vault,
  loadAccounts,
  deleteWallet,
  VultureAccountStore,
  AccountData,
} from "./vulture_backend/wallets/vultureWallet";
import { Modals, WalletStates } from "./types/uiTypes";
import { ModalEvents, ModalEventSystem } from "./modalEventSystem";
import { reactive, ref } from "@vue/reactivity";
import { useWalletInfo } from "./store/useWalletInfo";
import { VultureMessage } from "./vulture_backend/vultureMessage";

//openWebApp();
export default {
  name: "Vulture Wallet",
  components: {
    OverviewModule,
    DefaultButton,
    UnlockWallet,
    AccountsTab,
    SettingsTab,
    Onboarding,
    WalletTab,
    SendTab,
    Navbar,
    Modal,
  },
  setup() {
    // This setup() method *is* very messy, will move things out and do cleaning
    // Later when I decide to refactor. It is essentially entirely temporary.

    let vultureWallet = reactive(new VultureWallet());
    let walletState = ref(WalletStates.LOADING);
    let vault = ref("");

    // ----- Modal system -----
    let currentModal = ref(ModalEvents.NONE);
    let modalSystem = reactive(new ModalEventSystem());
    modalSystem.modalEvents.on("OpenModal", (data) => {
      currentModal.value = data.modal;
    });

    let modals = ModalEvents;
    let state = WalletStates;

    //Token variables, a bit messy to have this here, will refactor later.
    let tokenTypeToAdd = ref("");
    let addressOfTokenToView = ref("");

    // Address of token to transfer, empty is the native asset of the selected network.
    let addressOfTokenToTransfer = ref("");

    /* --- Transfer Asset Variables & Functions --- */

    let currentAccentColor = ref("#98ea79"); // default accent color :p
    let gradientColor1 = ref("#dff9aa");
    let gradientColor2 = ref("#ffe8a6");

    let selectedAccountIndex = ref(0);

    /* --- Transfer Asset Variables & Functions --- */

    let assetAmount = ref("Loading");
    let assetPrefix = ref("...");
    let address = ref("LOADING");
    doesWalletExist().then((value) => {
      if (value == true) {
        walletState.value = WalletStates.WALLET;
        loadVault().then((value: any) => {
          vault.value = value as any;
          walletState.value = WalletStates.PASSWORD_LOCKED;
        });
      } else {
        walletState.value = WalletStates.ONBOARDING;
      }
    });

    async function initWallet(vaultE: Vault) {
      loadAccounts().then(async (accounts) => {
        //vultureWallet = new VultureWallet(vault, accounts as VultureAccountStore);
        await vultureWallet.initWallet(vaultE, accounts as VultureAccountStore);
        walletState.value = WalletStates.WALLET;

        vultureWallet.walletEvents.on(
          VultureMessage.SUBSCRIBE_TO_ACC_EVENTS,
          (data) => {
            assetAmount.value = data.amount;
            assetPrefix.value =
              vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;
            currentAccentColor.value =
              vultureWallet.accountStore.currentlySelectedNetwork.networkColor;
            gradientColor1.value =
              vultureWallet.accountStore.currentlySelectedNetwork.networkGradient.hex1;
            gradientColor2.value =
              vultureWallet.accountStore.currentlySelectedNetwork.networkGradient.hex2;

            address.value = data.address;
          }
        );
      });
    }

    /* --- Modal functions --- */

    function resetWallet() {
      //currentModal.value = modals.RESET_WALLET
    }
    function onWalletReset() {
      //currentModal.value = modals.NONE;
      walletState.value = WalletStates.ONBOARDING;
    }

    function selectToken(tokenAddress: string) {
      addressOfTokenToTransfer.value = tokenAddress;
    }
    // I Use this function whenever the token should be reset to native, usually called when the user removes a token
    // from the list (through events).
    function resetSelectedToken() {
      addressOfTokenToTransfer.value = "";
    }

    return {
      vultureWallet,
      walletState,
      currentModal,
      vault,
      assetAmount,
      assetPrefix,
      address,

      modals,
      state,

      addressOfTokenToView,
      tokenTypeToAdd,

      modalSystem,

      selectedAccountIndex,

      addressOfTokenToTransfer,

      gradientColor1,
      gradientColor2,
      currentAccentColor,

      initWallet: initWallet,
      resetWallet: resetWallet,
      onWalletReset: onWalletReset,
      selectToken: selectToken,
      resetSelectedToken: resetSelectedToken,
    };
  },
  data() {
    //console.log(vault);
    return {
      currentTab: "send",
    };
  },
  props: {},
  methods: {
    setTab(tab: string) {
      this.currentTab = tab;
    },
  },
};
</script>

<style>
@font-face {
  font-family: fonticonA;
  src: url("./assets/fonts/MaterialIconsRound-Regular.otf");
}
@font-face {
  font-family: GardensC;
  src: url("./assets/fonts/Assistant/Assistant-VariableFont_wght.ttf");
}
@font-face {
  font-family: ButtonFont;
  font-weight: 800;
  src: url("./assets/fonts/GlacialIndifference-Regular.otf");
}
#app {
  margin: 0px;
  padding: 0px;
  font-family: GardensC;
}
body {
  margin: 0px;
  padding: 0px;
  font-family: GardensC;
}
html {
  --bg_color: rgb(22, 22, 22);
  --bg_color_2: rgb(38, 38, 38);

  --incorrect_color: rgb(255, 0, 65);
  --warning_color: rgb(255, 130, 58);
  --info_color: rgb(137, 145, 255);

  --fg_color: rgb(255, 255, 255);
  --fg_color_2: rgb(150, 150, 150);

  font-family: GardensC;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--fg_color);
  background-color: var(--bg_color);
  margin: 0px;
  padding: 0px;

  min-width: 360px;
  max-width: 360px;
  min-height: 560px;
  max-height: 560px;
}
::selection {
  background: var(--accent_color);
}
.infoColored {
  color: var(--info_color);
}
.warningColored {
  color: var(--warning_color);
}
.flexBox {
  display: flex;
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  flex-grow: 1;
}
.show {
  visibility: visible;
  transition-duration: 180ms;
  filter: opacity(1);
}
.hide {
  visibility: hidden;
  margin-top: 32px;
  transition-duration: 140ms;
  filter: opacity(0);
}
.accentColored {
  color: var(--accent_color);
}
.showLoader {
  visibility: visible;
  transition-duration: 180ms;
  filter: opacity(1);
}
.hideLoader {
  visibility: hidden;
  transition-duration: 140ms;
  filter: opacity(0);
}

.vultureLoaderBig {
  display: inline-block;
  width: 100px;
  height: 100px;
}
.quote {
  display: flex;
  box-sizing: border-box;
  color: var(--fg_color_2);
  word-wrap: normal;
  word-break: keep-all;
  white-space: normal;
  margin-top: 5px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 5px;
  margin-top: 5px;
  padding-left: 6px;

  border-left-style: solid;
  border-width: 1px;
  border-color: var(--accent_color);
  border-radius: 0px;
}
.vultureLoaderBig:after {
  content: " ";
  display: block;
  width: 100px;
  height: 100px;
  margin: 0px;
  border-radius: 50%;
  border: 3px solid;

  border-color: var(--accent_color) var(--bg_color_2) var(--accent_color)
    var(--bg_color_2);

  animation: vultureLoaderFrames 0.87s infinite;
  box-shadow: 0px 0px 8px black inset;
}
.fonticon {
  font-family: fonticonA;
  vertical-align: middle;
  font-size: 24px;
}
.vultureLoader {
  display: inline-block;
  width: 62px;
  height: 62px;
  margin: 5px;
}
.vultureLoader:after {
  content: " ";
  display: block;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 3px solid;

  border-color: var(--accent_color) var(--bg_color_2) var(--accent_color)
    var(--bg_color_2);

  animation: vultureLoaderFrames 0.87s infinite;
  box-shadow: 0px 0px 8px black inset;
}
.tooltip .tooltipText {
  visibility: hidden;
  width: auto;
  background-color: var(--bg_color);
  color: #fff;
  text-align: center;
  border-radius: 8px;

  font-family: GardensC;
  font-size: 18px;

  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 8px;
  padding-right: 8px;
  border-style: solid;
  border-width: 2px;
  border-color: var(--bg_color_2);

  position: absolute;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.3);
  z-index: 1;
  opacity: 0;

  pointer-events: none;

  color: var(--fg_color);

  transition-duration: 115ms;
  transform: scale(0.9, 0.9);
}

.tooltip:hover .tooltipText {
  visibility: visible;
  transition-delay: 0.2s;
  transition-duration: 115ms;
  transform: scale(1, 1);
  opacity: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:active .tooltipText {
  visibility: hidden;
  transition-delay: 0s;
  transition-duration: 80ms;
  transform: scale(0.9, 0.9);
  opacity: 0;
}
@keyframes vultureLoaderFrames {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

a {
  color: var(--accent_color);
  transition-duration: 180ms;
}
a:hover {
  text-shadow: 0px 0px 3px var(--accent_color);
  transition-duration: 180ms;
  text-decoration: none;
}
a:active {
  filter: brightness(80%);
}

*::-webkit-scrollbar {
  width: 3px;
}
*::-webkit-scrollbar-track {
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 1);
  background: rgb(16, 16, 16);
  border-radius: 5px;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--bg_color_2);
  border-radius: 5px;
}
</style>
