<template>

    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">

            <div class="outline">
                <div style="display: flex; width: 100%; margin-bottom: 0px; flex-direction: row;
                    align-items: center; justify-content: center;">
                    <div style="font-size: 24px; ">
                    Rewards &amp; Payouts
                    </div>
                </div>
                <hr style="width: 100%; margin-bottom: 15px;">

                <div class="vultureLoader" v-if="isLoading == true"></div>

                <div class="unlockingFundsBox"  v-for="(unlock, index) in unlockingEras" :key="(unlock, index)">
                    <div class="boxTitle">
                        <div class="fonticon">
                            &#xef57;
                        </div>
                        Scheduled Unstake <!-- :&nbsp; <span class="accentColored">{{index}}</span>  this looks kinda ugly tbh-->
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Amount (<span class="asset">${{asset}}</span>):
                        </div>
                        <div class="value">
                            {{unlock.balanceToUnlock}} 
                        </div>
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Unlocks in Era:
                        </div>
                        <div class="value">
                            {{unlock.eraOfUnlock}}
                        </div>
                    </div>
                    <div class="valueBox">
                        <div class="valueTitle">
                            Current Era:
                        </div>
                        <div class="value">
                            {{currentEra}}
                        </div>
                    </div>
                    <div class="valueBox" v-if="unlock.isUnlockable == true">
                        <div class="value accentColored"
                        style="width: 100%;  border-top-style: solid;border-bottom-style: none; padding-top: 10px; margin-top: 2px;">
                            Unlock by pressing 'Withdraw'
                        </div>
                    </div>
                </div>

            </div>
        </div>
        

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>

            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Withdraw" @button-click="quitModal()" v-if="hasUnlockableUnbonds == true"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, Ref, ref } from 'vue';
import { ModalEvents, ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";
import { SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";
import BigNumber from "bignumber.js";

export default defineComponent({
  name: "PayoutsModal",
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
    
    let isLoading = ref(true);

    let stakingInfo: SubstrateStakingInfo | null = null;
    let unlockingEras: Ref<any> = ref([]);

    let currentEra = ref('ERR');
    let asset: string = props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix;

    let hasUnlockableUnbonds = ref(false);

    props.vultureWallet.getStakingInfo().then((data) => {
        stakingInfo = data.params.stakingInfo as SubstrateStakingInfo;
        currentEra.value = stakingInfo.currentEra;
        for(let i = 0; i < stakingInfo.unlocking.length; i++) {
            let e = {
                eraOfUnlock: stakingInfo.unlocking[i].eraOfUnlock,
                balanceToUnlock: new BigNumber(stakingInfo.unlocking[i].balanceToUnlock)
                                    .div(new BigNumber(10)
                                    .pow(props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetDecimals))
                                    .toString(),
                isUnlockable: false
            }
            // Shows the withdraw buttons
            if(e.eraOfUnlock <= currentEra.value) {
                e.isUnlockable = true;
                hasUnlockableUnbonds.value = true;
            }
            unlockingEras.value.push(e);
        }
        isLoading.value = false;
    });

    function quitModal() {
        props.modalSystem.closeModal();
    }
    return {
        modal,
        asset,
        isLoading,
        currentEra,
        stakingInfo,
        unlockingEras,
        hasUnlockableUnbonds,

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
.boxTitle {
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
    width: 100%;
    align-items: center;
    text-align: center;
    font-size: 22px;
    border-bottom-style: solid;
    border-width: 1px;
    padding-bottom: 5px;
    border-color: var(--bg_color_2);
    margin-bottom: 5px;
}
.asset {
    font-size: 14px;
    color: var(--fg_color_2);
}
.valueBox {
    display: flex;
    box-sizing: border-box;
    margin: 2px;
    justify-content: space-between;
}
.value {
    font-size: 18px;
    border-bottom-style: solid;
    border-width: 1px;
    border-color: var(--bg_color_2);
}
.valueTitle {
    font-size: 18px;
    color: var(--fg_color_2);
}
.unlockingFundsBox {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-style: solid;
    border-width: 1px;
    padding: 10px;
    border-color: var(--bg_color_2);
    border-radius: 10px;
    width: 95%;
    height: fit-content;
}
.fonticon {
    color: var(--fg_color_2);
    margin-right: 5px;
    font-size: 25px;
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
