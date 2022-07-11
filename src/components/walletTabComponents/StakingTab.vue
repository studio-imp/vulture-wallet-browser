
<template>
    <div class="flexBox box">

    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import { VultureWallet } from '@/vulture_backend/wallets/vultureWallet';

import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue";

export default defineComponent({
  name: "StakingTab",
  components: {
    DefaultButton,
    MinimalInput,
  },
  props: {
      isWalletReady: Boolean,
      vultureWallet: {
      type: Object as PropType<VultureWallet>,
      required: true,
    },

  },
  setup(props, context) {
    return {

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
.box {
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: red;
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
