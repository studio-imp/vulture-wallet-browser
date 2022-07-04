<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <!--  ERC20   -->
        <div class="flexBox" style="flex-grow: 1; padding-left: 15px; padding-right: 15px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 10px; box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;"
         v-if="vultureWallet.tokenStore != null && tokenType == 'ERC20'">

            <div class="outline">

                <div style="width: 100%; margin-bottom: 5px; margin-top: 10px;">
                    <div style="font-size: 26px;">Token: 
                        {{token.name}}
                    </div>
                    <hr>
                </div>
                <div class="infoSection">
                    <div class="infoParagraph">
                    
                        Account: <span class="accentColored"> {{vultureWallet.currentWallet.accountData.accountName}} </span>
                        <br>

                        Has:
                        <span style="color: var(--accent_color);"> 
                            {{token.balance}}
                        </span>
                        <span style="font-size: 16px; color: var(--accent_color);">
                            ${{token.symbol}}
                        </span>
                        <br>
                        On: 
                        <span style="color: var(--accent_color);">
                            {{vultureWallet.accountStore.currentlySelectedNetwork.networkName}}
                        </span>
                    </div>
                </div>
                <div class="infoSection">
                    <div class="infoParagraph">
                        Token Address: 
                        <span class="accentColored" style="font-size: 15px;">
                            {{token.address}}
                        </span>
                        <br>
                    </div>
                </div>
                
                <div class="infoSection red">
                    <DefaultButton buttonHeight="25px" buttonWidth="150px" fontSize="17px" buttonText="Remove From List" @button-click="removeTokenFromList()"/>
                    <i style="font-size: 13px;  color: var(--fg_color_2); margin-top: 10px; margin-bottom: 5px;" >
                        Remove this NFT from the NFT token list. You will have to re-add it to see it again in the wallet!
                    </i>
                </div>

            </div>

        </div>

        <!--    ERC721    -->
        <div class="flexBox" style="flex-grow: 1; padding-left: 15px; padding-right: 15px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 10px; box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word;"
         v-if="vultureWallet.tokenStore != null && tokenType == 'ERC721'">

        <div class="outline">
            <div class="flexBox">
                <div style="width: 100%; margin-bottom: 5px;">
                    <div style="font-size: 26px;">
                        <span class="accentColored">$</span>{{token.symbol}} &nbsp;-&nbsp;
                        <span class="accentColored">{{selectedTokenIndex}}</span> / <span class="accentColored">{{token.balance}}</span>
                    </div>
                    <hr>
                </div>

            <div class="infoSection red">
                <DefaultButton buttonHeight="25px" buttonWidth="150px" fontSize="17px" buttonText="Remove From List" @button-click="removeTokenFromList()"/>
                <i style="font-size: 13px;  color: var(--fg_color_2); margin-top: 10px; margin-bottom: 5px;" >
                    Remove this NFT from the NFT token list. You will have to re-add it to see it again in the wallet!
                </i>
            </div>

            </div>
        </div>

         <!--
            <div style="width: 100%; margin-bottom: 5px;">
                <div style="font-size: 26px;">
                    {{token.name}}
                </div>
                <hr>
            </div>
            <div style="width: 100%; text-align: left; margin-top: 15px; font-size: 22px;">
                Account
                "<span style="color: var(--accent_color)">
                    {{vultureWallet.currentWallet.accountData.accountName}}
                </span>"
                <br>
                Has
                
                <span style="color: var(--accent_color);"> 
                    {{token.balance}}
                </span>
                <span style="color: var(--accent_color);">
                    &nbsp;{{token.symbol}}
                </span>
                <br>
                On
                <span style="color: var(--accent_color);">
                    {{vultureWallet.accountStore.currentlySelectedNetwork.networkName}}
                </span>
            </div>
            <div style="width: 100%; text-align: left; margin-top: 20px; font-size: 22px;">
                Token Address:
                <span style="color: var(--accent_color); font-size: 15px;">
                    {{token.address}}
                </span>
                    {{token.metadataURI}}
                <br>
                <hr style="margin-top: 20px;">
            </div>
         -->

        </div>

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 15px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="80px" buttonText="Back" @button-click="previousToken()"
            v-if="tokenType == 'ERC721'"/>
            <DefaultButton buttonHeight="40px" buttonWidth="120px" buttonText="Return" @button-click="quitModal()"/>

            <DefaultButton buttonHeight="40px" buttonWidth="80px" buttonText="Next" @button-click="nextToken()"
            v-if="tokenType == 'ERC721'"/>
            <!--
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Save" @button-click="saveAccount()"/>
            -->
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType, DefaultNetworks} from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { AbstractToken } from '@/vulture_backend/types/abstractToken';
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { TokenTypes } from "@/vulture_backend/types/tokenTypes";

export default defineComponent({
  name: "TokenViewModal",
  components: {
    DropdownSelection,
    DefaultButton,
    DefaultInput,
  },
  props: {
    vultureWallet: {
        type: Object as PropType<VultureWallet>,
        required: true,
    },
    tokenAddress: String,
    tokenType: String,
  },
  setup(props, context) {

    // For NFTs with unique token Id's 
    let selectedTokenIndex = ref(0);

    let token: AbstractToken = reactive({
      address: '',
      decimals: 0,
      name: '!Error!',
      symbol: '',
      logoURI: '',
      balance: '0'
    });

    let tokenMetadata: any;

    // Lots of ! here, too many, I know.
    switch(props.tokenType) {
        case "ERC20": {
            token = props.vultureWallet.tokenStore.tokenList.get(props.vultureWallet.accountStore.currentlySelectedNetwork.networkUri)!.get(props.tokenAddress!)!;
            break;
        }
        case "ERC721": {
            token = props.vultureWallet.tokenStore.NFTList.get(props.vultureWallet.accountStore.currentlySelectedNetwork.networkUri)!.get(props.tokenAddress!)!;

            // Fetch more detailed data about the NFT other than the balance. Needed to get metadata to display for the user.
            props.vultureWallet.currentWallet!.infoWorker.onmessage = async (event) => {
                if(event.data.method == VultureMessage.GET_TOKEN_DATA) {
                    if(event.data.params.success == true) {
                        if(event.data.params.tokenData.address == token.address) {
                            token.allTokenIds = event.data.params.tokenData.allTokenIds;

                            // Get the metadata for the token now that we've gotten more details about the NFT.
                            props.vultureWallet.currentWallet!.infoWorker.onmessage = async (event) => {
                                if(event.data.method == VultureMessage.GET_TOKEN_METADATA) {
                                    if(event.data.params.success == true) {
                                        console.log(event.data);
                                    }else {
                                        console.error("Failed getting token metadata!");
                                    }
                                };
                            };
                            props.vultureWallet.currentWallet!.infoWorker.postMessage({
                                method: VultureMessage.GET_TOKEN_METADATA,
                                params: {
                                    tokenAddress: token.address,
                                    tokenType: TokenTypes.ERC721,
                                    tokenId: token.allTokenIds![selectedTokenIndex.value],
                                }
                            });
                        }
                    }else {
                        console.error("Failed getting token data for NFT!");
                    }
                };
            };
            props.vultureWallet.currentWallet!.infoWorker.postMessage({
                method: VultureMessage.GET_TOKEN_DATA,
                params: {
                    tokenAddress: token.address,
                    tokenType: TokenTypes.ERC721,
                }
            });
            break;
        }
        default: {
            console.log("Token Type: " + props.tokenType + " is not available!");
        }
    }

    function quitModal() {
        context.emit("quit-modal");
    }
    function removeTokenFromList() {
        (props.vultureWallet as VultureWallet).removeTokenFromList(props.tokenAddress!, props.tokenType!);
        context.emit("reset-selected-token");
        quitModal();
    }

    function nextToken() {
        if(selectedTokenIndex.value < Number(token.balance)) {
            selectedTokenIndex.value++;
        }
    }
    function previousToken() {
        if(selectedTokenIndex.value > 0) {
            selectedTokenIndex.value--;
        }
    }

    return {
        selectedTokenIndex,

        removeTokenFromList: removeTokenFromList,
        previousToken: previousToken,
        nextToken: nextToken,
        quitModal: quitModal,
        token: token,
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
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 1px;
    border-style: solid;
    border-color: var(--bg_color_2);
    padding: 12px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin: 10px;
    margin-top: 0px;


    min-height: 454px;
    max-height: 454px;

    width: 302px;
    
    overflow: hidden;
    overflow-y: auto;

    border-radius: 4px;
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
.infoParagraph {
    width: 100%;
    text-align: left;
    font-size: 22px;
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
.red {
    outline-color: var(--incorrect_color);
    box-shadow: 0px 0px 4px var(--incorrect_color);
}
</style>
