<template>
    <div class="flexBox" style="height: 100%; width: 100%;">
        <div class="flexBox" style="flex-grow: 1; padding-left: 15px; padding-right: 15px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 5px; box-sizing: border-box; font-size: 24px;">
            
            <div style="width: 100%; text-align: center; margin-bottom: 10px; margin-top: 20px;">
                Select Network <br>
                <div style="font-size: 14px; color: var(--fg_color_2); margin-bottom: 5px; margin-top: 10px;">Addresses may vary depending on selected network.</div>
                <hr>
            </div>

            <div class="itemList" style="top: 0px; height: 370px;">
              <div class="flexBox" style="width: 100%; align-items: center;" >
              
                <NetworkModule style="margin-top: 10px;" v-for="item in networks.mainNets.values()" v-bind:key="item"
                :networkType="item.networkType"
                :networkName="item.networkName"
                :selected="vultureWallet.accountStore.currentlySelectedNetwork.networkName == item.networkName ? true : false"
                @module-click="selectNetwork($event)"/>
                <div style="width: 80%; background-color: var(--fg_color_2); height: 1px; margin-top: 10px; margin-bottom: 0px;">

                </div>
                <div style="font-size: 14px; color: var(--fg_color_2); margin-bottom: 5px; margin-top: 10px;">Networks below are Test-Networks!</div>

                <NetworkModule style="margin-top: 10px;" v-for="item in networks.testNets.values()" v-bind:key="item"
                :networkType="item.networkType"
                :networkName="item.networkName"
                :selected="vultureWallet.accountStore.currentlySelectedNetwork.networkName == item.networkName ? true : false"
                @module-click="selectNetwork($event)"/>

              <!--
                <span style="font-size: 14px;  color: var(--fg_color_2); margin-bottom: 5px;">You can add custom networks in the<br> settings tab.</span>
              -->

              </div>

          <!--
            <AccountModule accountIndex="2" accountType="Mnemonic" accountName="DeFi"/>
          -->
        </div>

        </div>
        <div class="flexBox" style="flex-grow: 0; margin-bottom: 15px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue";
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import NetworkModule from "../NetworkModule.vue"

import { VultureWallet, createNewAccount } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { DefaultNetworks } from "@/vulture_backend/types/networks/network";
import { ModalEventSystem } from "@/modalEventSystem";

export default defineComponent({
  name: "SelectNetworkModal",
  components: {
    DropdownSelection,
    NetworkModule,
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

    let accountName: string;
    const networks = new DefaultNetworks();

    let accountAmount = ref(0);
    accountAmount.value = props.vultureWallet.accountStore.allAccounts.length;
    let selectedNetwork = reactive({network: networks.AlephZero});

    function quitModal() {
      props.modalSystem.closeModal();
    }

    function selectNetwork(name: string) {
      console.info("Switch to " + name);
      props.vultureWallet.switchNetwork(name);
      quitModal();
    }

    return {
        networks,
        accountAmount,
        selectedNetwork,

        selectNetwork: selectNetwork,
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
    background-color: var(--fg_color_2);
}
.itemList {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  border-radius: 12px;

  border-width: 0px;
  height: 100%;
  width: 100%;

  align-items: center;

  outline-style: solid;
  outline-width: 1px;
  outline-color: var(--bg_color_2);
    

  justify-content: flex-start;
  overflow: hidden;
  overflow-y: auto;
  padding-top: 5px;
  border-radius: 4px;
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

</style>
