
<template>
    <div class="flexBox stakingBox" style="min-height: 333px;" v-if="stakingStatus != 'Loading'">

        <div class="flexBox outlineSection" v-if="stakingStatus == 'NotStaked'">
            <div class="flexBox infoRow">
                  <div class="infoParagraph">
                      This account is currently not staking
                       $<span class="accentColored">
                          {{asset}}
                        </span>.
                  </div>
            </div>
        </div>

        <div class="flexBox outlineSection" v-if="stakingStatus == 'NotStaked'">
            <div class="flexBox infoRow">
                  <div class="infoParagraph">
                      Feel free to read our <a href="https://docs.vulturewallet.net/staking" target="_blank">staking guide</a>, and then start staking.
                  </div>
            </div>
        </div>

        <div class="flexBox outlineSection" style="align-items: center;" v-if="stakingStatus == 'NotStaked'">
            <div class="flexBox infoRow">
            <DefaultButton buttonWidth="130px" buttonHeight="40px" fontSize="20px" buttonText="Transfer" @click="transferBetweenAccounts()"/>
            <DefaultButton buttonWidth="130px" buttonHeight="40px" fontSize="20px" buttonText="Stake" @click="stakeFunds()"/>
            </div>
        </div>
    
        <!-- The amount the current account has staked -->
        <div class="flexBox outlineSection" v-if="stakingStatus != 'NotStaked'">
            <div class="flexBox infoRow">
                  <div class="infoTitle">
                      <div class="icon">
                          &#xe897;
                      </div>
                      Staked:
                  </div>
                  <div class="infoValue">
                      {{Math.round(Number(stakedAmount) *  Math.pow(10, 3)) / Math.pow(10, 3)}} <span class="asset">${{asset}}</span>
                 </div>
            </div>
            <div class="flexBox infoRow" style="margin-top: 5px;">
                <div class="infoTitleSmall">
                    Reward Dest: 
                </div>
                <div class="infoValue" style="font-size: 19px;">
                    Staking Address <!-- Switching reward destination coming soon ^-^ -->
                </div>
            </div>
        </div>

        <div class="flexBox outlineSection" v-if="stakingStatus == 'NotNominating'">
            <div class="flexBox infoRow">
                  <div class="infoParagraph">
                      You need to <span class="accentColored">nominate</span> to earn rewards from staked funds.
                  </div>
            </div>
            <div class="flexBox infoRow" style="margin-top: 10px;">
                  <div class="infoParagraph">
                      You can <span class="accentColored">nominate</span> in the Stake-Menu.
                  </div>
            </div>
        </div>


        <!-- The current account nominee -->
        <div class="flexBox outlineSection" v-if="stakingStatus == 'Staked'">
            <div class="flexBox infoRow">
                  <div class="infoTitle">
                      <div class="icon">
                          &#xe175;
                      </div>
                      Nominee Info
                  </div>
            </div>
            
            <div class="flexBox infoRow" style="margin-top: 5px;">
                <div class="infoTitleSmall">
                    Address: 
                </div>
                <div class="infoValue address">
                    {{nominee}}
                </div>
            </div>
        </div>

        <div class="flexBox outlineSection" style="align-items: center; width: auto; margin-top: auto;" v-if="stakingStatus != 'NotStaked'">
            <DefaultButton buttonWidth="130px" buttonHeight="35px" fontSize="20px" buttonText="Stake Menu" @click="openStakeMenu()"/>
        </div>

    </div>
    <div v-else class="flexBox stakingBox" style="justify-content: center;">
        <div class="vultureLoaderBig">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import { VultureWallet } from '@/vulture_backend/wallets/vultureWallet';

import DefaultButton from "../building_parts/DefaultButton.vue";
import MinimalInput from "../building_parts/MinimalInput.vue";
import { ModalEvents, ModalEventSystem } from '@/modalEventSystem';
import { VultureMessage } from '@/vulture_backend/vultureMessage';
import { NetworkType } from '@/vulture_backend/types/networks/networkTypes';
import { SubstrateStakingInfo } from '@/vulture_backend/types/stakingInfo';

export default defineComponent({
  name: "StakingTab",
  components: {
    DefaultButton,
    MinimalInput,
  },
  props: {
        isWalletReady: Boolean,
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

    let stakingStatus = ref('Loading');

    let asset = ref(props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix);

    // --- Staking Data ---
    let stakedAmount = ref(0);
    let nominee = ref('');

    // Callback for staking information, we use this to update the current staking data.
    props.vultureWallet.currentWallet.accountEvents.on(VultureMessage.GET_STAKING_INFO, async (data) => {
        switch(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType) {
            case NetworkType.Substrate: {
                let stakingData = data as SubstrateStakingInfo;

                stakedAmount.value = Number(stakingData.stakedBalance);
                nominee.value = stakingData.nominationAddress == null ? '' : stakingData.nominationAddress;

                if(Number(stakingData.stakedBalance) > 0) {
                    if(stakingData.nominationAddress == null || stakingData.nominationAddress == '') {
                        stakingStatus.value = 'NotNominating';
                    }else {
                        stakingStatus.value = 'Staked';
                    }
                }else {
                    stakingStatus.value = 'NotStaked';
                }

              break;
            }
            default: {
              console.log("This network isn't added to vulture yet.");
            }
        }
    });
    // Calling this once without a regard for the returned promise, since we are directly using the
    // Event callback above instead.
    props.vultureWallet.getStakingInfo();

    function openStakeMenu() {
        props.modalSystem.openModal(ModalEvents.STAKE_MENU, null);
    }
    function transferBetweenAccounts() {
        props.modalSystem.openModal(ModalEvents.TRANSFER_BETWEEN_STAKING_ACCOUNT, null);
    }
    function stakeFunds() {
        props.modalSystem.openModal(ModalEvents.BOND_FUNDS, null);
    }
    function nominate() {
        props.modalSystem.openModal(ModalEvents.NOMINATE_VALIDATOR, null);
    }
    function unstakeFunds() {
        props.modalSystem.openModal(ModalEvents.UNBOND, null);
    }
    return {
        asset,
        nominee,
        stakedAmount,
        stakingStatus,

        nominate: nominate,
        stakeFunds: stakeFunds,
        unstakeFunds: unstakeFunds,
        openStakeMenu: openStakeMenu,
        transferBetweenAccounts: transferBetweenAccounts,
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
    width: 100%;
    background-color: var(--fg_color_2);
}

.fonticon {
    font-size: 20px;
    vertical-align: middle;
}
.icon {
    color: var(--fg_color_2);
    font-family: fonticonA;
    display: inline-block;
    vertical-align: middle;
    font-size: 24px;
    margin-right: 5px;
}
.iconSmall {
    color: var(--fg_color_2);
    font-family: fonticonA;
    display: inline-block;
    vertical-align: middle;
    font-size: 20px;
    margin-right: 5px;
}
.infoRow {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.infoParagraph {
    align-items: flex-start;
    text-align: left;
    font-size: 18px;
    padding-left: 10px;
    border-left-style: solid;
    border-width: 1px;
    border-color: var(--accent_color);
}
.infoTitle {
    display: flex;
    align-items: center;
    font-size: 21px;
    padding-left: 5px;
}
.infoTitleSmall {
    display: flex;
    align-items: center;
    font-size: 18px;
    padding-left: 5px;
    color: var(--fg_color_2);
}
.infoValue {
    color: var(--accent_color);
    font-size: 21px;
    border-bottom-style: solid;
    border-width: 1px;
    border-color: var(--bg_color_2);
}
.asset {
    font-size: 14px;
    color: var(--fg_color_2);
}
.address {
    font-size: 14px;
    max-width: 70%;
    word-break: break-all;

    padding: 4px;
}
.outlineSection {
    margin-bottom: 10px;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;

    border-style: solid;
    border-radius: 8px;
    border-width: 1px;
    border-color: var(--bg_color_2);

    width: 100%;
    flex-grow: 0;
    padding: 10px;

    transition-duration: 180ms;
}

.outlineSection:hover {
    border-color: rgb(60,60,60);
    transition-duration: 180ms;
}
.quote {
  font-size: 18px;
}
.stakingBox {
  box-sizing: border-box;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-height: 282px;
  height: 100%;
  padding: 10px;


  overflow-y: auto;
}
*::-webkit-scrollbar {
  border-radius: 0px;
  opacity: 0;
  display: none;
}

*::-webkit-scrollbar-track {
  border-radius: 0px;
}

*::-webkit-scrollbar-thumb {
  border-radius: 0px;
    border-radius: 10px;
}
</style>
