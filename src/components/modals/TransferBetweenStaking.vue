<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="width: 100%;">
                    <div style="font-size: 26px;">
                        Transfer Between
                    </div>
                    <hr>
                </div>
                <div class="infoSection">
                    <div class="infoParagraph addressSection">
                        Deposit Address: <span class="accentColored addressText"> {{vultureWallet.currentWallet.accountData.address.slice(0,10) + '...'}}</span>
                    </div>
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored addressText"> {{Math.round(Number(accountBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                    </div>
                </div>

                <div class="infoSection">
                    <div class="infoParagraph addressSection">
                        Staking Address: <span class="accentColored addressText"> {{stakingAddress.slice(0,10) + '...'}}</span>
                    </div>
                    <div class="infoParagraph addressSection">
                        Balance: <span class="accentColored addressText"> {{Math.round(Number(stakingAddressBalance) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                    </div>
                </div>

            </div>

        </div>


        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="120px" buttonText="Return" @button-click="quitModal()"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { NetworkFeatures, NetworkType } from "@/vulture_backend/types/networks/networkTypes";
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { StakingInfo, SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";

export default defineComponent({
  name: "TransferBetweenStaking",
  components: {
    DropdownSelection,
    DefaultButton,
    DefaultInput,
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
    let stakingAddress = ref('');
    let stakingAddressBalance = ref('');

    let accountBalance = ref(props.vultureWallet.currentWallet.accountData.freeAmountWhole);

    if(stakingSupport.value == true) {
        stakingAddress.value = props.vultureWallet.currentWallet.accountData.stakingAddress!;
        if(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType == NetworkType.Substrate) {
            let stakingData = props.vultureWallet.currentWallet.accountData.stakingInfo.get(StakingInfo.Substrate) as SubstrateStakingInfo;  
            stakingAddressBalance.value = stakingData.liquidBalance;
        }

    }else {
        console.warn("The currently selected network doesn't support staking!");
    }

    function quitModal() {
        props.modalSystem.closeModal();
    }

    return {
        stakingAddressBalance,
        accountBalance,
        stakingAddress,

        quitModal: quitModal,
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
.smallerHr {
    background-color: var(--bg_color_2);
    height: 1px;
    width: 90%;
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
    font-size: 20px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.description {
    font-size: 16px;
}
.vultureLogo {
    fill: var(--bg_color);
    filter: drop-shadow(0px 0px 5px rgb(2,2,2));
}
.styled {
    color: var(--accent_color);
}
.welcomeText {
    font-size: 16px;
    text-align: center;
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

*::-webkit-scrollbar {
  width: 3px;        
 
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

</style>
