<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">

                <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    Nominate
                    </div>
                    <div style="font-size: 24px; margin-left: 5px; margin-top: 3px;" class="fonticon">
                        &#xe175;
                    </div>
                </div>
                <hr style="width: 100%; margin-bottom: 0px;">

                <div class="infoSection" style="margin-top: auto; margin-bottom: auto;" v-if="statusCode == 'NominationInfo'">
                    <div style="display: flex; width: 100%; margin-bottom: 5px; flex-direction: row;
                    align-items: center; justify-content: center;">
                        <div style="font-size: 24px; ">
                        Info
                        </div>
                        <div style="font-size: 22px; margin-left: 5px; margin-top: 3px;" class="fonticon">
                            &#xe88e;
                        </div>
                    </div>
                    <hr style="width: 100%; margin-bottom: 10px;">
                    <div class="infoParagraph" style="font-size: 19px;">
                        You need to nominate a <span class="accentColored">validator</span> to earn staking rewards.
                        <hr class="seperatorHr">
                        The <span class="accentColored">validator</span> gains more power in the network as a result of your stake.

                        <hr class="seperatorHr">
                        You will earn less rewards if the <span class="accentColored">validator</span> behaves maliciously.
                        <hr class="seperatorHr">
                        Feel free to read our <a href="https://docs.vulturewallet.net/staking" target="_blank">Staking Guide</a>.
                        <hr class="seperatorHr">
                        <div class="accentColored" style="text-align: center; font-size: 24px;">Proceed?</div>
                    </div>
                </div>

                <div class="validatorBox" v-if="statusCode == 'SelectValidator'">
                    <div style="display: flex; width: 100%; flex-direction: row;
                    align-items: center; justify-content: center;">
                        <div style="font-size: 22px;margin: 7px;">
                        Select Validator
                        </div>
                        <div style="font-size: 22px; margin-left: 5px; margin-top: 3px;" class="fonticon">
                            &#xe177;
                        </div>
                    </div>
                    <hr class="smallerHr" style="margin-top: 0px; margin-bottom: 0px;">
                    <div class="validatorScroll" v-if="isValidatorInfoPending == false">
                        <ValidatorModule v-for="(validator, index) in allValidators" v-bind:key="(validator, index)"
                        :address="validator.address"
                        :comission="validator.comission"
                        :name="validator.name"
                        :webURI="validator.webURI"
                        :email="validator.email"
                        :index="index"
                        @selectValidator="selectValidator($event)"/>
                    </div>
                    <div v-else class="flexBox" style="width: 100%; height: 100%; align-items: center;">
                        <div class="vultureLoader" style="margin-top: auto; margin-bottom: auto;">
                        </div>
                    </div>
                </div>

                <div class="infoSection" style="margin-top: 10px; margin-auto: 10px;" v-if="statusCode == 'ConfirmNomination' || statusCode == 'Sent'">
                    <div class="infoParagraph addressSection">
                        Deposit Address: <span class="accentColored addressText"> {{accountAddress}}</span> <span class="fonticon" style="font-size: 20px;">&#xe177;</span>
                    </div>
                    <hr class="smallerHr">
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored"> {{Math.round(Number(accountBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span style="font-size: 14px;" >$<span class="accentColored">{{asset}}</span></span> <span class="fonticon" style="font-size: 20px;">&#xe898;</span>
                    </div>
                </div>

                <div>
                    <div class="birdsOnBranch" v-if="statusCode == 'BondExtra' || statusCode == 'Bond'" >
                    <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="190" height="122" viewBox="0, 0, 400,244"><g id="svgg"><path id="path0" d="M61.600 28.120 C 64.460 30.787,66.207 32.777,65.482 32.541 C 63.287 31.828,52.800 30.958,52.800 31.489 C 52.800 31.761,55.988 33.585,59.884 35.542 L 66.968 39.100 67.804 43.328 C 68.599 47.345,68.504 47.827,65.920 52.959 C 60.168 64.381,64.137 81.339,75.527 94.000 C 78.628 97.448,78.969 98.157,77.997 99.137 C 76.470 100.676,76.205 100.520,59.761 88.401 L 45.652 78.003 49.226 74.374 C 54.155 69.369,54.570 69.726,37.400 64.219 C 17.784 57.929,18.804 56.952,24.352 76.704 C 29.508 95.059,28.739 93.980,33.418 89.414 L 37.200 85.723 59.200 101.717 C 71.300 110.513,84.814 120.300,89.232 123.466 L 97.264 129.222 138.832 127.066 C 161.694 125.881,182.382 124.886,184.804 124.855 L 189.208 124.800 226.004 153.216 C 262.311 181.255,262.843 181.627,266.000 181.259 C 267.760 181.053,287.560 179.552,310.000 177.923 L 350.800 174.962 374.991 186.281 C 388.296 192.506,399.366 197.600,399.591 197.600 C 399.816 197.600,400.000 194.968,400.000 191.750 L 400.000 185.901 375.717 174.636 L 351.434 163.372 308.322 166.773 L 265.209 170.174 228.405 141.753 L 191.600 113.333 157.200 115.117 C 138.280 116.098,119.609 117.115,115.708 117.377 L 108.617 117.853 109.175 114.326 C 109.482 112.387,111.053 108.470,112.666 105.623 L 115.600 100.445 122.645 97.815 L 129.691 95.186 135.563 96.690 C 139.013 97.574,145.018 100.158,150.118 102.953 C 159.808 108.264,161.600 109.061,161.600 108.061 C 161.600 106.514,153.813 98.880,145.962 92.733 C 136.756 85.524,136.531 85.214,140.000 84.520 C 144.478 83.624,145.042 84.411,122.205 59.717 C 114.481 51.365,110.157 46.047,109.677 44.309 C 108.630 40.516,97.964 28.234,94.877 27.266 C 87.042 24.810,85.624 24.699,78.716 25.993 C 71.951 27.261,71.866 27.256,65.238 25.234 C 55.973 22.408,55.705 22.621,61.600 28.120 M90.916 103.279 C 94.488 103.901,97.775 103.916,102.165 103.329 C 105.576 102.873,108.490 102.623,108.639 102.773 C 109.458 103.592,105.160 109.668,101.656 112.644 L 97.602 116.087 89.669 110.332 C 79.291 102.802,79.557 101.301,90.916 103.279 " stroke="none" fill-rule="evenodd"></path></g></svg>                    </div>
                </div>
            </div>
        </div>



        <div class="flexBox" style="flex-grow: 0; margin-bottom: 8px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Proceed" @button-click="setCode('SelectValidator')" v-if="statusCode == 'NominationInfo'"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import ValidatorModule from "../ValidatorModule.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { ModalEvents, ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { NetworkFeatures, NetworkType } from "@/vulture_backend/types/networks/networkTypes";
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { StakingInfo, SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";
import { TxState } from "@/types/uiTypes";
import { BigNumber } from "bignumber.js";

export default defineComponent({
  name: "StakeFundsModal",
  components: {
    DropdownSelection,
    ValidatorModule,
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

    let stakingSupport = ref(props.vultureWallet.supportsFeature(NetworkFeatures.STAKING));
    let stakedBalance = ref(0);

    let currentNominee = ref('');

    let currentNetwork = props.vultureWallet.accountStore.currentlySelectedNetwork.networkName;
    let asset = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;

    let statusCode = ref('NominationInfo');
    
    let accountBalance = ref(props.vultureWallet.currentWallet.accountData.freeAmountWhole);
    let accountAddress = ref(props.vultureWallet.currentWallet.accountData.address);

    let validatorInfo;

    let isValidatorInfoPending = ref(true);

    let allValidators: {
        address: string,
        comission: number,
        email?: string
        name?: string,
        webURI?: string,
    }[] = [];

    let selectedValidator: {
        address: string,
        comission: number,
        email?: string
        name?: string,
        webURI?: string, 
    } | null = null;

    props.vultureWallet.getValidatorInfo().then((data) => {
        let validators = Array.from(data.validatorInfo.keys()) as string[];
        for(let i = 0; i < validators.length; i++) {
            let validator = data.validatorInfo.get(validators[i]);
            let comission = Number(validator.comission) / Math.pow(10, 9);
            allValidators.push({
                address: validators[i],
                comission: comission,
                email: validator.identity.email == undefined ? undefined : validator.identity.email,
                webURI: validator.identity.webURI == undefined ? undefined : validator.identity.webURI,
                name: validator.identity.name == undefined ? undefined : validator.identity.name,
            });
        }
        isValidatorInfoPending.value = false;
    });
    

    if(stakingSupport.value == true) {

        if(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType == NetworkType.Substrate) {
            let stakingData = props.vultureWallet.currentWallet.accountData.stakingInfo.get(StakingInfo.Substrate) as SubstrateStakingInfo;  
            
            stakedBalance.value = Number(stakingData.stakedBalance);

            currentNominee.value = stakingData.nominationAddress == null ? '' : stakingData.nominationAddress;
            if(currentNominee.value != '') {
                statusCode.value = 'SelectValidator'
            }
        }

    }else {
        console.warn("The currently selected network doesn't support staking!");
    }

    function quitModal() {
        props.modalSystem.closeModal();
    }

    function setCode(code: string) {
        statusCode.value = code;
    }
    function selectValidator(index: number) {
        selectedValidator = allValidators[index];
        console.log(selectedValidator);
    }

    return {
        isValidatorInfoPending,
        accountBalance,
        currentNetwork,
        stakedBalance,
        accountAddress,
        allValidators,
        statusCode,
        asset,
        setCode: setCode,
        quitModal: quitModal,
        selectValidator: selectValidator,
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
.fonticon {
    color: var(--fg_color_2);
}
.birdsOnBranch {
    position: absolute;
    bottom: 34px;
    pointer-events: none;
    fill: rgba(0,0,0,0.2);
}
.smallerHr {
    background-color: var(--bg_color_2);
    height: 1px;
    border-radius: 10px;
    width: 100%;
}
.seperatorHr {
    width: 100%;
    background-color: var(--bg_color_2);
    height: 1px;
    margin-bottom: 10px;
    margin-top: 10px;
}

.validatorBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 1px;
    border-style: solid;
    border-color: var(--bg_color_2);
    box-sizing: border-box;


    height: 100%;
    width: 100%;

    margin-top: 15px;
    
    overflow: hidden;

    border-radius: 5px;
}
.validatorScroll {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding-bottom: 10px;
    padding-top: 10px;
    overflow: hidden;
    overflow-y: auto;
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-style: none;
    border-bottom-style: solid;
    border-color: var(--bg_color_2);
    padding: 15px;
    box-sizing: border-box;
    margin: 0px;


    min-height: 475px;
    max-height: 475px;

    width: 100%;
    
    overflow: hidden;
    overflow-y: auto;

    border-radius: 0px;
}
.amountStatusText {
    font-size: 16px;
    color: var(--fg_color_2);
}
.infoSection {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    align-items: center;
    margin: 8px;
    margin-left: 5px;
    margin-right: 5px;
    padding: 10px;
    outline: solid;
    outline-width: 1px;
    border-radius: 4px;
    outline-color: var(--bg_color_2);

    width: 100%;
}
.sectionTitleContainer {
    display: flex;
    width: 100%;
}
.sectionDescription {
    font-size: 22px;
    margin-right: auto;
    margin-left: auto;
}
.temporary {
    display: flex;
    margin: 0px;
    width: 100%;
    box-sizing: border-box;
    padding: 0px;
    flex-direction: row;
    margin-bottom: auto;
    margin-top: auto;

    transition-duration: 150ms;
}
.infoIcon {
    font-family: fonticonA;
    font-size: 22px;
}
.infoParagraph {
    width: 100%;
    text-align: left;
    font-size: 22px;
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
.description {
    font-size: 16px;
}

.transferBetweenBox {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    
    padding: 5px;

    outline-style: solid;
    outline-width: 1px;
    outline-color: var(--bg_color_2);

    margin-bottom: auto;
    margin-top: auto;

    transition-duration: 120ms;

    border-radius: 4px;
}
.transferArrow {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    font-family: fonticonA;
    width: 20px;
    height: 20px;
    margin: 5px;
    color: var(--bg_color_2);
    user-select: none;
    transition-duration: 125ms;
}
.directionButton {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 38px;
    font-family: fonticonA;
    width: 48px;
    height: 48px;
    margin-top: 5px;
    outline-style: solid;
    border-radius: 50px;
    outline-width: 2px;
    color: var(--fg_color_2);
    user-select: none;
    transition-duration: 125ms;
    cursor: pointer;
}
.directionButton:hover {
    color: var(--accent_color);
    transition-duration: 170ms;
}
.directionButton:active {
    filter: brightness(75%);
    transition-duration: 125ms;
}
.circle {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    max-width: 115px;
    width: auto;
    height: 30px;
    max-height: 30px;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 10px;
    outline-style: solid;
    border-radius: 10px;
    outline-width: 2px;
    outline-color: var(--bg_color_2);
    color: var(--accent_color);

    white-space: nowrap;

    overflow-y: hidden;
    overflow-x: auto;
}
.stakingDirection {
    transform: rotate(180deg);
    transition-duration: 160ms;
}
.description {
    color: var(--fg_color_2);
    font-size: 15px;
    width: 80%;
}
.box {
    flex-direction: column;
    background-color: var(--bg_color);
    box-shadow: 0px 0px 7px rgb(7, 7, 7);
    border-width: 2px;
    border-color: var(--bg_color_2);
    border-style: solid;
    border-radius: 24px;
    z-index: 2;
}

.hideDisplay {
    display: none;
}

.blinkAccent {
    animation: blink 1s infinite;
}
.accentColored {
    color: var(--accent_color);
}
@keyframes blink {
    0% {
        color: var(--bg_color_2);
    }
    50% {
        color: var(--accent_color);
    }
    100% {
        color: var(--bg_color_2);
    }
}

.showSection {
  transition-duration: 180ms;
  filter: opacity(1);
}
.hideSection {
  transition-duration: 140ms;
  filter: opacity(0);
}

*::-webkit-scrollbar {
    width: 5px;        
    height: 3px;
}
*::-webkit-scrollbar-track {
  box-shadow: 0px 0px 0px rgba(0,0,0,1);
  background: rgb(16,16,16);
  border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--bg_color_2);
  border-radius: 10px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 180ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
