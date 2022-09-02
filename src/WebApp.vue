<template>  
  <div class="flexBox" style="width: 100vw; height: 100vh;">
    <Onboarding v-if="state == states.ONBOARDING"/>
    <AddHardwareWallet v-if="state == states.CREATE_LEDGER_WALLET"/>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue-demi";
import Onboarding from "./src_web_app/Onboarding.vue";
import AddHardwareWallet from "./src_web_app/AddHardwareWallet.vue";

import { getWebAppState, WebAppStates } from "./src_web_app/utils/webAppState";

export default defineComponent({
  name: "WebApp",
  data(){
    return {

    }
  },
  components: {
    AddHardwareWallet,
    Onboarding,
  },
  setup() {
    let state = ref("LOADING");
    let states = WebAppStates;
    
    getWebAppState().then((webAppState) => {
      state.value = webAppState;
    }).catch((error) => {
      state.value = WebAppStates.ONBOARDING;
    });

    return {
      state,
      states
    }
  }
})
</script>

<style>
@font-face {
    font-family: fonticonA;
    src: url("./assets/fonts/fa-solid-900.ttf");
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
#webApp {
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
  --bg_color_2: rgb(34, 34, 34);
  
  --fg_color: rgb(255,255,255);
  --fg_color_2: rgb(150, 150, 150);

/*
 */
  --accent_color: #98ea79;

  font-family: GardensC;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--fg_color);
  background-color: var(--bg_color);
  margin: 0px;
  padding: 0px;
}
a {
  color: var(--accent_color);
  transition-duration: 100ms;
}
a:hover {
  transition-duration: 100ms;
  text-shadow: 0px 0px 3px var(--accent_color);
  text-decoration: none;
}
::selection {
  background: var(--accent_color);
}
.flexBox{
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-grow: 1;
}
</style>
