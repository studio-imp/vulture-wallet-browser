<template>
  <div class="module" :class="isHovering == true ? 'moduleHover' : ''">
        <div class="flexBox" @mouseenter="isHovering = true" @mouseleave="isHovering = false" @click="toggleExpand()"
        :class="isExpanded == true ? 'moduleHeaderOpen' : 'moduleHeaderCollapsed'"
        style="flex-direction: row; width: 100%; align-items: center; padding:  5px;">

          <div class="icon">
              &#xe7fd;
          </div>
          <div class="flexBox left" style="flex-direction: row;">
            "<div class="overflowEllipsis">{{name == '' ? address : name}}</div>"
          </div>
          <div class="right">
            {{(comission * 100).toFixed(2)}}%
          </div>
        </div>

        <div class="flexBox" style="width: 100%; align-items: center; padding: 10px;" v-if="isExpanded == true">
            <div v-if="name != ''" class="infoParagraph">
                Name: <span class="accentColored">{{name}}</span>
            </div>
            <div  class="infoParagraph">
                Comission: <span class="accentColored">{{comission * 100}}%</span>
            </div>
            <div v-if="email != ''"  class="infoParagraph">
                Email: <span class="accentColored">{{email}}</span>
            </div>
            <div v-if="webURI != ''"  class="infoParagraph">
                Website: <span class="accentColored">{{webURI}}</span>
            </div>
            <div  class="infoParagraph addressSection">
                Address: <span class="addressText accentColored">{{address}}</span> <span class="fonticon" style="font-size: 20px;">&#xe177;</span>
            </div>
            <hr class="smallerHr">
            <div class="flexBox" style="margin-top: 5px; margin-bottom: 2px; z-index: 10;">
                <DefaultButton buttonHeight="35px" buttonWidth="190px" buttonText="Select Validator" fontSize="20px" @button-click="selectValidator()"/>
            </div>
        </div>
  </div>
</template>

<script>
import { defineComponent, PropType, reactive, ref } from 'vue';
import DefaultButton from '../components/building_parts/DefaultButton.vue';

export default defineComponent({
  name: "ValidatorModule",
  components: {
    DefaultButton
  },
  props: {
    address: String,
    comission: Number,

    email: String,
    webURI: String,
    name: String,

    index: Number
  },

  setup(props, context) {
    let isExpanded = ref(false);

    let isHovering = ref(false);

    function toggleExpand() {
        isExpanded.value = !isExpanded.value;
    }
    function selectValidator() {
      context.emit("selectValidator", props.index);
    }
    return {
        isExpanded,
        isHovering,
        
        toggleExpand: toggleExpand,
        selectValidator: selectValidator,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.icon {
  font-family: fonticonA;
  font-size: 28px;
  margin: 5px;
  margin-left: 15px;
}
.selectedAccount {
  color: var(--accent_color);
}
.fonticon {
    color: var(--fg_color_2);
}
hr {
    margin-top: 5px;
    margin-bottom: 5px;
    border: none;
    height: 1px;
    border-radius: 5px;
    background-color: var(--fg_color_2);
}
.smallerHr {
    background-color: var(--bg_color_2);
    height: 1px;
    border-radius: 10px;
    width: 100%;
}
.right {
  margin: 10px;
  font-size: 18px;
  flex-grow: 1;
  justify-self: flex-end;
  text-align: right;
}
.left {
  margin: 10px;
  font-size: 18px;
  max-width: 58%;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
}
.overflowEllipsis {
  text-overflow: ellipsis;
  overflow: hidden;
}
.underline {
  background-color: var(--fg_color);
  height: 2px;
  border-radius: 10px;
  margin-top: 5px;
  width: 100%;
  align-self: left;
}
.infoParagraph {
    width: 100%;
    margin-bottom: 3px;
    text-align: left;
    font-size: 19px;
}
.addressSection {
    word-break: break-all;
}
.addressText {
    box-sizing: border-box;
    outline: none;
    font-size: 15px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.moduleHeaderCollapsed {
  border-radius: 12px;
  background-color: var(--bg_color);
  user-select: none;
  cursor: pointer;
}
.moduleHeaderOpen {
  background-color: rgb(18,18,18);
  border-radius: 12px;
  border-bottom-style: solid;
  border-width: 2px;
  border-color: var(--bg_color_2);
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  user-select: none;
  cursor: pointer;
}
.moduleHeaderOpen:active {
  transition-duration: 160ms;
  filter: brightness(75%);
}
.moduleHeaderCollapsed:active {
  transition-duration: 80ms;
  filter: brightness(75%);
}
.module {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 15px;
  margin-top: 6px;
  margin-bottom: 6px;

  box-sizing: border-box;
  border-color: var(--bg_color_2);
  border-width: 2px;
  border-radius: 12px;
  border-style: solid;


  box-shadow: 0px 0px 3px rgb(6,6,6);

  width: 90%;
  height: auto;

  transition-duration: 160ms;
}
.moduleHover {
  transition-duration: 160ms;
  box-shadow: 0px 0px 8px rgb(6,6,6);
  border-color: var(--accent_color);
}

</style>
