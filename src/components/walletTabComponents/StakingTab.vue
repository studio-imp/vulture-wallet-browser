
<template>
    <div class="flexBox stakingBox">
      <div style="width: 90%;">
        This is a temporary testing-zone for staking, view info in console! :D
      </div>
      <DefaultButton buttonWidth="190px" buttonHeight="30px" fontSize="20px" buttonText="View Staking Info" @click="getStakingInfoTEST()"/>
      <DefaultButton buttonWidth="190px" buttonHeight="30px" fontSize="20px" buttonText="Transfer Funds"  @click="transferBetweenAccounts()"/>
      <DefaultButton buttonWidth="190px" buttonHeight="30px" fontSize="20px" buttonText="Stake Funds"  @click="stakeFunds()"/>
      <DefaultButton buttonWidth="190px" buttonHeight="30px" fontSize="20px" buttonText="Nominate Validator"  @click="nominate()"/>
      <DefaultButton buttonWidth="190px" buttonHeight="30px" fontSize="20px" buttonText="Unstake"  @click="unstakeFunds()"/>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import { VultureWallet } from '@/vulture_backend/wallets/vultureWallet';

import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue";
import { ModalEvents, ModalEventSystem } from '@/modalEventSystem';

export default defineComponent({
  name: "StakingTab",
  components: {
    DefaultButton,
    MinimalInput,
  },
  props: {
      isWalletReady: Boolean,
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
    function getStakingInfoTEST() {
      props.vultureWallet.getStakingInfo();
    }

    function transferBetweenAccounts() {
      props.modalSystem.openModal(ModalEvents.TRANSFER_BETWEEN_STAKING_ACCOUNT, null);
    }
    function stakeFunds() {
      props.modalSystem.openModal(ModalEvents.BOND_FUNDS, null);
    }
    function nominate() {
      props.modalSystem.openModal(ModalEvents.NOMINATE_VALIDATOR, null);
    }
    function unstakeFunds() {
      props.modalSystem.openModal(ModalEvents.UNBOND, null);
    }
    return {
      nominate: nominate,
      stakeFunds: stakeFunds,
      unstakeFunds: unstakeFunds,
      transferBetweenAccounts: transferBetweenAccounts,
      getStakingInfoTEST: getStakingInfoTEST,
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
.stakingBox {
  box-sizing: border-box;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
*::-webkit-scrollbar {
  border-radius: 10px;
}

*::-webkit-scrollbar-track {
  border-radius: 0px;
}

*::-webkit-scrollbar-thumb {
  border-radius: 0px;
    border-radius: 10px;
}
</style>
