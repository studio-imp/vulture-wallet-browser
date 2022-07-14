<template>
  <div class="overviewModule">
    <div class="flexBox" style="width: 100%;">
      <div class="flexBox" style="width: 100%; flex-direction: row;">

        <div class="amountText" v-if="isWalletReady == true">
          {{ Number(assetAmount).toFixed(4) }}<span class="assetName">{{ assetPrefix }}</span>
            <div class="underline"/>
        </div>
        <div v-else class="flexBox" style="">
            <div class="vultureLoader" style="margin-left: 15px; margin-top: 16px;"></div>
        </div>

        <div class="flexBox" style="">
          <div class="selectAccountButton" style="margin-left: auto; margin-right: 20px; margin-top: 20px;" @click="selectAccount()">
            &#xf02e;
          </div>
          <div class="selectAccountButton" style="margin-left: auto; margin-right: 20px; margin-top: 8px;" @click="selectNetwork()">
            &#xe9f4;
          </div>
        </div>
      </div>

      <div class="flexBox" style="width: 100%; justify-content: flex-end; align-items: center;">
        <div style="margin: 6px; margin-left: 20px; align-self: flex-start; font-size 16px;">
        <div class="accountName" style="font-size 16px;">Account: <span class="accentColored">{{accountName}}</span></div>
        </div>
        <div class="addressText" v-if="isWalletReady == true">
          {{ address }}
        </div>
        <div class="addressText" v-else>
          ~~~ Loading ~~~
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ModalEvents, ModalEventSystem } from "@/modalEventSystem";
import { defineComponent } from "@vue/runtime-core"
import { PropType } from "vue";

export default defineComponent({
  name: "OverviewModule",
  props: {
    modalSystem: {
      type: Object as PropType<ModalEventSystem>,
      required: true,
    },
    address: String,
    accountName: String,
    assetPrefix: String,
    assetAmount: String,
    isWalletReady: Boolean,
  },
  setup(props, context) {
    function selectAccount() {
      props.modalSystem.openModal(ModalEvents.SELECT_ACCOUNT, null);
    }
    function selectNetwork() {
      props.modalSystem.openModal(ModalEvents.SELECT_NETWORK, null);
    }
    return {
      selectAccount: selectAccount,
      selectNetwork: selectNetwork
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.accountName {
  font-size: 16px;
  min-width: 250px;
  max-width: 250px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.selectAccountButton {
  font-family: fonticonA;
  font-size: 24px;
  cursor: pointer;
  transition-duration: 120ms;
  color: var(--fg_color_2)
}
.selectAccountButton:hover {
  color: var(--accent_color);
  text-shadow: 0px 0px 5px var(--accent_color);
  transition-duration: 120ms;
}
.selectAccountButton:active {
  color: var(--accent_color);
  text-shadow: 0px 0px 5px var(--accent_color);
  filter: brightness(75%);
  transition-duration: 120ms;
}
.addressText {
  margin-bottom: 12px;

  font-size: 12px;
  color: var(--accent_color);

  font-weight: bold;

  width: 86%;

  border-width: 2px;
  border-color: var(--bg_color_2);
  border-style: solid;

  padding: 7px;
  border-radius: 7px;
}
.assetName {
  font-size: 15px;
  color: var(--accent_color);
  font-weight: bold;
}
.underline {
  background-color: var(--fg_color);
  height: 1px;
  border-radius: 10px;
  margin-top: 5px;
  width: 100%;
  align-self: left;
}
.overviewModule {
  z-index: 1;
  box-sizing: border-box;
  border-width: 2px;
  border-color: var(--bg_color_2);
  border-style: solid;
  border-top-style:none;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: auto;
  height: 160px;

  border-bottom-left-radius:  18px;
  border-bottom-right-radius: 18px;
  box-shadow: 0px 0px 4px rgb(6,6,6);
  /*
   */
}
.amountText {
  margin: 20px;
  font-size: 28px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
