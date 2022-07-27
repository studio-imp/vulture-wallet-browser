<template>
  <div @click="moduleClick()" class="module" v-bind:class="selected == true ? 'selectedAccount' : ''">
    <div class="icon">
      &#xea3d;
    </div>
      <div class="flexBox left" style="flex-direction: row;">
        "<div class="overflowEllipsis">{{name == null ? address : name}}</div>"
      </div>
      <div class="right">
        {{comission * 100}}%
      </div>
  </div>
</template>

<script>
export default {
  name: "ValidatorModule",
  props: {
    address: String,
    comission: Number,

    email: String,
    webURI: String,
    name: String,

    index: Number
  },
  methods: {
    moduleClick(){
       this.$emit('module-click', this.index);
    }
  }
};
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


.right {
  margin: 10px;
  font-size: 17px;
  flex-grow: 1;
  justify-self: flex-end;
  text-align: right;
}
.left {
  margin: 5px;
  font-size: 17px;
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
.module {
  display: flex;
  align-items: center;

  margin: 20px;
  margin-top: 5px;
  margin-bottom: 8px;

  box-sizing: border-box;
  border-color: var(--bg_color_2);
  border-width: 2px;
  border-radius: 12px;
  border-style: solid;

  box-shadow: 0px 0px 3px rgb(6,6,6);

  width: 90%;
  min-height: 52px;

  cursor: pointer;

  transition-duration: 160ms;
}
.module:hover {
  transition-duration: 160ms;
  box-shadow: 0px 0px 8px rgb(6,6,6);
  border-color: var(--accent_color);
  color: var(--accent_color);
}
.module:active {
  transition-duration: 160ms;
  box-shadow: 0px 0px 8px rgb(6,6,6);
  filter: brightness(75%);
}
</style>
