<template>

    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    The Stake Menu 🥩
                    </div>
                </div>
                <hr style="width: 100%; margin-bottom: 15px;">
                <div class="buttonRow">
                    <div class="stakeButton" @click="openModal(modal.BOND_FUNDS)"> 
                        <div class="buttonTitle">
                            Stake
                        </div>
                        <div class="fonticon">
                            &#xe897;
                        </div>
                    </div>
                    <div class="stakeButton"  @click="openModal(modal.NOMINATE_VALIDATOR)">
                        <div class="buttonTitle">
                            Nominate
                        </div>
                        <div class="fonticon">
                            &#xe175;
                        </div>
                    </div>
                    <div class="stakeButton" @click="openModal(modal.UNBOND)">
                        <div class="buttonTitle">
                            Unstake
                        </div>
                        <div class="fonticon">
                            &#xe898;
                        </div>
                    </div>
                </div>
                <div class="buttonRow ">
                    <div class="disabledButton">
                        <div class="buttonTitle">
                            Staking Info 
                        </div>
                        <div class="tempText">
                            coming soon (╥﹏╥)
                        </div>
                        <!--

                        <div class="fonticon">
                            &#xe88e;
                        </div>
                        -->
                    </div>
                </div>
                <div class="buttonRow">
                    <div class="stakeButton" @click="openModal(modal.PAYOUTS)">
                        <div class="buttonTitle">
                            Payouts
                        </div>
                        <div class="fonticon"> 
                            &#xe227;
                        </div>
                    </div>
                    <div class="stakeButton" @click="openModal(modal.TRANSFER_BETWEEN_STAKING_ACCOUNT)">
                        <div class="buttonTitle">
                            Transfer
                        </div>
                        <div class="fonticon"> 
                            &#xea18;
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="birdsOnBranch">
                <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="195" height="125" viewBox="0, 0, 400,244"><g id="svgg"><path id="path0" d="M61.600 28.120 C 64.460 30.787,66.207 32.777,65.482 32.541 C 63.287 31.828,52.800 30.958,52.800 31.489 C 52.800 31.761,55.988 33.585,59.884 35.542 L 66.968 39.100 67.804 43.328 C 68.599 47.345,68.504 47.827,65.920 52.959 C 60.168 64.381,64.137 81.339,75.527 94.000 C 78.628 97.448,78.969 98.157,77.997 99.137 C 76.470 100.676,76.205 100.520,59.761 88.401 L 45.652 78.003 49.226 74.374 C 54.155 69.369,54.570 69.726,37.400 64.219 C 17.784 57.929,18.804 56.952,24.352 76.704 C 29.508 95.059,28.739 93.980,33.418 89.414 L 37.200 85.723 59.200 101.717 C 71.300 110.513,84.814 120.300,89.232 123.466 L 97.264 129.222 138.832 127.066 C 161.694 125.881,182.382 124.886,184.804 124.855 L 189.208 124.800 226.004 153.216 C 262.311 181.255,262.843 181.627,266.000 181.259 C 267.760 181.053,287.560 179.552,310.000 177.923 L 350.800 174.962 374.991 186.281 C 388.296 192.506,399.366 197.600,399.591 197.600 C 399.816 197.600,400.000 194.968,400.000 191.750 L 400.000 185.901 375.717 174.636 L 351.434 163.372 308.322 166.773 L 265.209 170.174 228.405 141.753 L 191.600 113.333 157.200 115.117 C 138.280 116.098,119.609 117.115,115.708 117.377 L 108.617 117.853 109.175 114.326 C 109.482 112.387,111.053 108.470,112.666 105.623 L 115.600 100.445 122.645 97.815 L 129.691 95.186 135.563 96.690 C 139.013 97.574,145.018 100.158,150.118 102.953 C 159.808 108.264,161.600 109.061,161.600 108.061 C 161.600 106.514,153.813 98.880,145.962 92.733 C 136.756 85.524,136.531 85.214,140.000 84.520 C 144.478 83.624,145.042 84.411,122.205 59.717 C 114.481 51.365,110.157 46.047,109.677 44.309 C 108.630 40.516,97.964 28.234,94.877 27.266 C 87.042 24.810,85.624 24.699,78.716 25.993 C 71.951 27.261,71.866 27.256,65.238 25.234 C 55.973 22.408,55.705 22.621,61.600 28.120 M90.916 103.279 C 94.488 103.901,97.775 103.916,102.165 103.329 C 105.576 102.873,108.490 102.623,108.639 102.773 C 109.458 103.592,105.160 109.668,101.656 112.644 L 97.602 116.087 89.669 110.332 C 79.291 102.802,79.557 101.301,90.916 103.279 " stroke="none" fill-rule="evenodd"></path></g></svg>                    </div>
            </div>
        </div>

        

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { ModalEvents, ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";

export default defineComponent({
  name: "StakeMenuModal",
  components: {
    DropdownSelection,
    DefaultButton,
    MinimalInput,
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

    let modal = ModalEvents;

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function openModal(modal: ModalEvents) {
        props.modalSystem.openModal(modal, null);
    }
    return {
        modal,

        openModal: openModal,
        quitModal: quitModal
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
    border-radius: 5px;
    background-color: var(--fg_color_2);
}
.buttonTitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: auto;
    font-size: 20px;
    border-bottom-width: 1px;
    padding-bottom: 4px;;
    border-bottom-style: solid;
    border-color: var(--bg_color_2);
}
.birdsOnBranch {
    position: absolute;
    bottom: 45px;
    pointer-events: none;
    fill: rgba(0,0,0,0.25);
}
.fonticon {
    color: var(--bg_color_2);
    filter: brightness(140%);
    margin-top: 8px;
    font-size: 25px;
}
.buttonRow {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;

    width: 100%;
}
.stakeButton {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin: 5px;
    width: 100%;
    height:  86px;
    border-style: solid;
    border-width: 2px;
    border-radius: 10px;
    padding: 10px;
    border-color: var(--bg_color_2);
    box-shadow: 0px 0px 4px rgba(0,0,0,0.6);
    cursor: pointer;
    transition-duration: 150ms;
    user-select: none;
}
.stakeButton:hover {
    transition-duration: 100ms;
    border-color: var(--accent_color);

}
.stakeButton:active {
    filter: brightness(50%);
    transition-duration: 100ms;
}
.tempText {
    color: var(--bg_color_2);
    filter: brightness(180%);
    margin-top: 8px;
    font-size: 17px;
}
.disabledButton {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin: 5px;
    width: 100%;
    height:  86px;
    border-style: solid;
    border-width: 2px;
    border-radius: 10px;
    padding: 10px;
    border-color: var(--bg_color_2);
    box-shadow: 0px 0px 4px rgba(0,0,0,0.6);
    cursor:not-allowed;
    transition-duration: 150ms;
    user-select: none;
    
    filter: brightness(80%);
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-style: none;
    border-bottom-style: solid;
    border-color: var(--bg_color_2);
    padding: 10px;
    box-sizing: border-box;
    margin: 0px;


    min-height: 475px;
    max-height: 475px;

    width: 100%;
    
    overflow: hidden;
    overflow-y: auto;

    border-radius: 0px;
}
</style>
