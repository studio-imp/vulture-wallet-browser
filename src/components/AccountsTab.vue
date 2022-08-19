<template>
    <div class="flexBox box">
        <div class="itemList" style="top: 5px;">
          <div class="flexBox" style="width: 95%; align-items: center;" >
            
            <AccountModule v-for="(item, index) in allAccounts" v-bind:key="item"
            :accountIndex="index + 1"
            :accountType="item.walletType"
            :accountName="item.accountName"
            :selected="vultureWallet.selectedWalletIndex == (index + 1) ? true : false"
            @module-click="modifyAccount($event)" style="margin-bottom: 10px;"/>

            <div class="flexBox" style="flex-grow: 0; margin-bottom: 15px; width: 70%; flex-direction: row; align-self: center; justify-content: space-evenly;">
              <DefaultButton :buttonDisabled="vultureWallet.accountStore.allAccounts.length > 1 ? false : true " @button-click="removeAccount()" style="margin-top: 5px; margin-bottom: 15px;"
               buttonWidth="100px" buttonHeight="30px" buttonText="Remove" fontSize="16px"/>
  
              <DefaultButton @button-click="createNewAccount()" style="margin-top: 5px; margin-bottom: 15px;"
               buttonWidth="100px" buttonHeight="30px" buttonText="Create" fontSize="16px"/>
            </div>
          </div>

          <!--
            <AccountModule accountIndex="2" accountType="Mnemonic" accountName="DeFi"/>
          -->
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "./building_parts/DefaultButton.vue";
import DefaultInput from "./building_parts/DefaultInput.vue";
import AccountModule from "../components/AccountModule.vue"

import { AccountData, VultureWallet } from '../vulture_backend/wallets/vultureWallet'
import { defineComponent, PropType } from '@vue/runtime-core';
import { ref } from 'vue';
import { ModalEvents, ModalEventSystem, ModifyAccountData } from "@/modalEventSystem";

export default defineComponent({
  name: "AccountsTab",
  components: {
    DefaultButton,
    AccountModule,
    DefaultInput
  },
  props: {
    modalSystem: {
      type: Object as PropType<ModalEventSystem>,
      required: true,
    },
    allAccounts: {
      type: Array as PropType<AccountData[]>,
    },
    vultureWallet: {
      type: Object as PropType<VultureWallet>,
      required: true,
    }
  },
  methods: {
  },
  setup(props, context) {

    function createNewAccount() {
      props.modalSystem.openModal(ModalEvents.CREATE_NEW_ACCOUNT, null);
    }

    function modifyAccount(index: number) {
      let data: ModifyAccountData = {
        arrayIndexOfAccount: index,
      }
      props.modalSystem.openModal(ModalEvents.MODIFY_ACCOUNT, data);
    }

    function removeAccount() {
      props.vultureWallet.popAccount();
    }

    return {
      createNewAccount: createNewAccount,
      removeAccount: removeAccount,
      modifyAccount: modifyAccount,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
    min-height: 381px;
    max-height: 381px;
    flex-direction: column;
}
.itemList {
  position: absolute;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  border-radius: 0px;

  border-width: 0px;
  height: 100%;
  width: 100%;

  align-items: center;
    

  justify-content: flex-start;
  overflow: hidden;
  overflow-y: auto;
}
</style>
