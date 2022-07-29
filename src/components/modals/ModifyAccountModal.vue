<template>
    <div class="flexBox" style="height: 100%; width: 100%;">
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center; box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;">


        <div class="outline">

            <DefaultInput :startValue="accountName" @on-enter="setName($event)" inputWidth="100%" inputHeight="40px" fontSize="18px" inputName="Account Name" inputPlaceholder="Name"/>
            
            <div class="infoSection">
                <div class="sectionTitleContainer" style="flex-direction: row;">
                    <div class="sectionDescription">
                        Account Info
                        <span style="font-size: 16px;">
                            $<span class="accentColored">
                                {{vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix}}
                            </span>
                        </span>
                    </div>
                </div>
                <hr>

                <div class="infoParagraph">
                    Account Index: <span class="accentColored">{{vultureWallet.accountStore.allAccounts[selectedAccount - 1].accountIndex}}</span> <br>
                    
                    <i>Accounts will always be the same at each given index.</i>
                </div>
                <hr class="smallerHr">

                <div class="infoParagraph addressSection">
                    Deposit Address
                    <span style="color: var(--accent_color); font-size: 15px;">{{address}}</span> <span class="fonticon" style="font-size: 20px;">&#xe177;</span>
                    <br>
                    <i>Addresses will vary depending on the selected network.</i>
                    <hr class="smallerHr" style="margin-top: 10px;">
                </div>

                <div class="infoParagraph">
                    Balance: <span class="accentColored">{{Math.round(Number(accountBalance) *  Math.pow(10, 5)) / Math.pow(10, 5)}}</span>
                    <span class="accentColored" style="font-size: 14px;">
                        &nbsp;{{vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix}}
                    </span>
                </div>

            </div>

            <div class="infoSection" v-if="stakingSupport == true">
                <div class="sectionTitleContainer" style="flex-direction: row;">
                    <div class="sectionDescription">
                        Staking Info
                    </div>
                </div>
                <hr>

                <div class="infoParagraph addressSection">
                    Staking Address:
                    <span style="color: var(--accent_color); font-size: 15px;">{{stakingAddress}}</span> <span class="fonticon" style="font-size: 20px;">&#xe177;</span>
                    <br>
                    <i>
                        You can stake in the Wallet Tab.
                    </i>
                    <hr class="smallerHr">
                    <div class="infoParagraph">
                        Staked: <span class="accentColored">{{Math.round(Number(stakingAddressStaked) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span class="accentColored" style="font-size: 14px;">
                            &nbsp;{{vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix}}
                        </span>
                    </div>
                    <div class="infoParagraph">
                        Free: <span class="accentColored">{{Math.round(Number(stakingAddressFree) *  Math.pow(10, 3)) / Math.pow(10, 3)}}</span>
                        <span class="accentColored" style="font-size: 14px;">
                            &nbsp;{{vultureWallet.accountStore.currentlySelectedNetwork.networkAssetPrefix}}
                        </span>
                    </div>
                    <i>
                        You can transfer between staking and deposit address in the Wallet Tab.
                    </i>
                </div>

            </div>

        </div>

        </div>
        <div class="flexBox" style="flex-grow: 0; margin-bottom: 8px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Save" @button-click="saveAccount()"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType} from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import BigNumber from "bignumber.js";
import { NetworkFeatures, NetworkType } from "@/vulture_backend/types/networks/networkTypes";
import { DefaultNetworks } from "@/vulture_backend/types/networks/network";
import { ModalEventSystem, ModifyAccountData } from "@/modalEventSystem";
import { StakingInfo, SubstrateStakingInfo } from "@/vulture_backend/types/stakingInfo";

export default defineComponent({
  name: "ModifyAccount",
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

    let selectedAccount = (props.modalSystem.getModalData() as ModifyAccountData).arrayIndexOfAccount;

    let accountName: string = props.vultureWallet.accountStore.allAccounts[selectedAccount - 1].accountName;

    const networks = new DefaultNetworks();
    let currentNetwork = props.vultureWallet.accountStore.currentlySelectedNetwork;

    let accountBalance = ref(0);

    let address = ref(props.vultureWallet.accountStore.allAccounts[selectedAccount - 1].address);
    let stakingAddress = ref('');
    let stakingAddressFree = ref(0);
    let stakingAddressStaked = ref(0);

    let stakingSupport = ref(props.vultureWallet.supportsFeature(NetworkFeatures.STAKING));

    props.vultureWallet.currentWallet.infoWorker.onmessage = (event) => {
        if(event.data.method == VultureMessage.GET_BALANCE_OF_ADDRESS) {
            if(event.data.params.address == address.value) {           //data.data, I know, hush.
                accountBalance.value = new BigNumber(event.data.params.data.data.free)
                .div(new BigNumber(10).pow(props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetDecimals)).toNumber();
            }
        }
    };
    props.vultureWallet.currentWallet.infoWorker.postMessage({
        method: VultureMessage.GET_BALANCE_OF_ADDRESS,
        params: {
            address: props.vultureWallet.accountStore.allAccounts[selectedAccount - 1].address
        }
    });
    if(stakingSupport.value == true) {
        if(props.vultureWallet.accountStore.currentlySelectedNetwork.networkType == NetworkType.Substrate) {
            let stakingData = props.vultureWallet.currentWallet.accountData.stakingInfo.get(StakingInfo.Substrate) as SubstrateStakingInfo; 
            stakingAddressFree.value = Number(stakingData.liquidBalance);
            stakingAddressStaked.value = Number(stakingData.stakedBalance);
        }
        stakingAddress.value = props.vultureWallet.currentWallet.accountData.stakingAddress!;
    }

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function setName(name: string) {
        accountName = name;
    }
    function saveAccount() {
        props.vultureWallet.accountStore.allAccounts[selectedAccount - 1].accountName = accountName;
        props.vultureWallet.saveAccounts();
        quitModal();
    }

    return {
        selectedAccount,
        accountBalance,
        currentNetwork,
        stakingSupport,
        stakingAddress,
        accountName,
        networks,
        address,

        stakingAddressFree,
        stakingAddressStaked,

        quitModal: quitModal,
        setName: setName,
        saveAccount: saveAccount,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
hr{
    margin-top: 5px;
    margin-bottom: 10px;
    border: none;
    height: 1px;
    background-color: var(--fg_color_2);
    width: 100%;
}
i{
    display: flex;
    box-sizing: border-box;
    color: var(--fg_color_2);
    word-wrap:normal;
    word-break: keep-all;
    white-space: normal;
    margin-top: 5px;
    font-size: 14px;
    width: 100%;
    margin-bottom: 5px;
    margin-top: 5px;
    padding-left: 6px;
    
    border-left-style: solid;
    border-width: 1px;
    border-color: var(--accent_color);
    border-radius: 0px;
}
.fonticon {
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

    font-size: 20px;

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
.infoIcon {
    font-family: fonticonA;
    font-size: 22px;
}
.infoParagraph {
    width: 100%;
    text-align: left;
    font-size: 19px;
    margin-bottom: 5px;
}
.smallerHr {
    background-color: var(--bg_color_2);
    height: 1px;
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
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
</style>
