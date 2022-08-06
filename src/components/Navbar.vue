<template>
  <div class="flexBox" style="align-items: center;">
      <div class="navbar">
           <div @click="onTabSwitch('send')" class="iconFont tooltip" :class="currentTab == 'send' ? 'selected' : ''">
               &#xef63;
                <div class="navbarUnderline" :class="currentTab == 'send' ? 'showUnderline' : ''">

                </div>

                <div class="tooltipText" style="margin-left: -16px;">
                    send
                </div>
           </div>
            <div @click="onTabSwitch('wallet')" class="iconFont tooltip" :class="currentTab == 'wallet' ? 'selected' : ''">
               &#xe850;
                <div class="navbarUnderline" :class="currentTab == 'wallet' ? 'showUnderline' : ''">
                </div>

                <div class="tooltipText" style="margin-left: -21px;">
                    wallet
                </div>
           </div>
            <div @click="onTabSwitch('accounts')" class="iconFont tooltip" :class="currentTab == 'accounts' ? 'selected' : ''">
               &#xe03f;
                <div class="navbarUnderline" :class="currentTab == 'accounts' ? 'showUnderline' : ''">
                </div>

                <div class="tooltipText" style="margin-left: -32px;">
                    accounts
                </div>
           </div>
            <div @click="onTabSwitch('settings')" class="iconFont tooltip" :class="currentTab == 'settings' ? 'selected' : ''">
               &#xe8b8;
                <div class="navbarUnderline" :class="currentTab == 'settings' ? 'showUnderline' : ''">
                </div>

                <div class="tooltipText" style="margin-left: -28px;">
                    settings
                </div>
           </div>
      </div>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  props: {
  },
  data() {
      return {
          currentTab: "send"
      }
  },
  methods: {
    onTabSwitch(newTab) {
        this.$emit('switch-tab', newTab);
        this.currentTab = newTab;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: row;
    margin: 5px;
    border-radius: 10px;
    height: 40px;
    width: 325px;
    background-color: var(--bg_color);

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.iconFont {
    width: 24px;
    font-size: 24px;
    font-family: fonticonA;
    color: var(--fg_color_2);
    transition-duration: 190ms;
    cursor: pointer;
}
.iconFont:hover {
    color: var(--accent_color);
    transition-duration: 190ms;
}
.iconFont:active {
    filter: brightness(75%);
}
.selected {
    color: var(--accent_color);
}
.navbarUnderline {
    margin-top: 5px;
    background-color: var(--accent_color);
    width: 100%;
    height: 3px;
    border-radius: 10px;
    transition-duration: 180ms;
    transform-origin: center;
    transform: scale(0, 1);
    opacity: 0;
}
.showUnderline {
    width: 100%;
    transform: scale(1, 1);
    transition-duration: 180ms;
    opacity: 100;
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
  box-shadow: 0px 0px 12px rgba(0,0,0,0.3);
  z-index: 1;
  opacity: 0;

  pointer-events: none;

  color: var(--fg_color);

  transition-duration: 115ms;
  transform: scale(0.90,0.90);


}


.tooltip:hover .tooltipText {
  visibility: visible;
  transition-delay: 0.2s;
  transition-duration: 115ms;
  transform: scale(1,1);
  opacity: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:active .tooltipText {
  visibility: hidden;
  transition-delay: 0s;
  transition-duration: 80ms;
  transform: scale(0.90,0.90);
  opacity: 0;
}
</style>
