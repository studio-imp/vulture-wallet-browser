<template>
  <div class="overviewModuleParent"> <!-- This is the gradient. -->
    <div class="overviewModule">
      <div class="flexBox" style="width: 100%; flex-grow: 0;">
        <div class="flexBox" style="width: 100%; flex-direction: row; margin-top: 10px;">

          <div class="amountText" v-if="isWalletReady == true">
            {{ Number(assetAmount).toFixed(4) }}<span class="assetName">{{ assetPrefix }}</span>
              <div class="underline"/>
          </div>
          <div v-else class="flexBox" style="">
              <div class="vultureLoader" style="margin-left: 15px; margin-top: 5px;"></div>
          </div>

          <div class="flexBox" style="margin-right: 20px;">
            <div class="selectAccountButton" style="margin-left: auto;  margin-bottom: 5px;" @click="selectAccount()">
              &#xf02e;
            </div>
            <div class="selectAccountButton" style="margin-left: auto;" @click="selectNetwork()">
              &#xe9f4;
            </div>
          </div>
        </div>

        <div class="flexBox" style="width: 100%; justify-content: flex-end; align-items: center; flex-grow: 0; overflow: hidden;">
          <div class="flexBox" style="align-self: flex-start; font-size 15px; flex-direction: row; color: var(--fg_color_2);">
              <div class="flexBox accountDataBox" v-if="isWalletReady == true">
                "<span class="accountName">{{ accountName }}</span>"&nbsp;-&nbsp;
                <span class="addressText tooltip" @click="copyAddress()">
                  {{ address }}
                  <div class="tooltipText" style="margin-left: -10px; margin-top: 2px;">
                    Click to Copy
                  </div>
                </span>
              </div>
          </div>
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
    function copyAddress() {
      if(props.address != null) {
        navigator.clipboard.writeText(props.address);
      }
    }
    return {
      copyAddress: copyAddress,
      selectAccount: selectAccount,
      selectNetwork: selectNetwork
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.accountName {
  font-size: 18px;
  text-align: left;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  flex-direction: row;

  color: var(--accent_color);
}
.addressText {
  width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;

  text-decoration: underline;
  text-underline-offset: 1px;

  user-select: none;

  color: var(--fg_color_2);

  transition-duration: 125ms;

  cursor: pointer;
}
.addressText:hover {
  color: var(--accent_color);
  transition-duration: 125ms;
}
.addressText:active {
  filter: brightness(70%);
  transition-duration: 125ms;
}
.accountDataBox {
  flex-direction: row;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  word-break: keep-all;
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
.overviewModuleParent {
  margin-right: 12px;
  border-radius: 12px;
  margin-bottom: 5px;
  margin-left: 12px;
  margin-top: 12px;
  padding: 2px;


  background: linear-gradient(0deg, rgba(191,238,174,1) 0%, rgba(233,178,148,1) 100%);
}
.overviewModule {
  z-index: 1;
  box-sizing: border-box;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: auto;
  height: auto;
  height: 103px;

  box-sizing: border-box;
  padding-bottom: 15px;

  background-color: var(--bg_color);

  border-width: 2px;
  border-color: var(--bg_color_2);
  /*
  border-style: solid;
   */

  overflow: hidden;
  
  border-radius: 12px;
  /*
   */
}
.amountText {
  margin: 12px;
  margin-top: 0px;
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
