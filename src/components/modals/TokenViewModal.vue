<template>

    <!-- (new modal system will fix this clusterfk, don't worry). -->
    <div class="flexBox" style="height: 100%; width: 100%;">
        
        <!--  ERC20   -->
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center;  box-sizing: border-box; font-size: 20px;
        overflow-wrap: break-word;"
         v-if="vultureWallet.tokenStore != null && tokenData.tokenType == tokenTypes.ERC20">

            <div class="outline">

                <div style="width: 100%; margin-bottom: 10px;">
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
                            {{Math.round(Number(token.balance) *  Math.pow(10, 5)) / Math.pow(10, 5)}}
                        </span>
                        <span style="color: var(--accent_color); font-size: 16px;">
                            &nbsp; <span style="color: var(--fg_color)">$</span>{{token.symbol}}
                        </span>
                        <br>
                        On: 
                        <span style="color: var(--accent_color);">
                            {{vultureWallet.accountStore.currentlySelectedNetwork.networkName}}
                        </span>
                    </div>
                </div>
                <div class="infoSection" style="margin-bottom: auto;">
                    <div class="infoParagraph addressSection">
                        Token Address: <span class="accentColored addressText">{{token.address}}</span> <span class="fonticon">&#xe177;</span>
                        <br>
                    </div>
                </div>

                <div class="infoSection" style="margin-bottom: auto;">
                    <div class="flexBox" style="flex-direction: row; margin-top: 8px; align-items: center;">
                        <span class="fonticon" style="margin: 5px; margin-right: 10px; color: var(--warning_color); font-size: 25px;">&#xe002;</span>
                        <DefaultButton buttonHeight="30px" buttonWidth="150px" fontSize="17px" buttonText="Remove From List" @button-click="removeTokenFromList()"/>
                        <span class="fonticon" style="margin: 5px;  margin-left: 10px; color: var(--warning_color); font-size: 25px;">&#xe002;</span>
                    </div>
                    <i style="font-size: 13px;  color: var(--fg_color_2); margin-top: 10px; margin-bottom: 5px;" >
                        Remove this token from the token list. You will have to re-add it to see it again in the wallet!
                    </i>
                </div>

            </div>

        </div>

        <!--    ERC721    -->
        <div class="flexBox" style="flex-grow: 1; width: 100%; margin-top: 10px;
        flex-direction: column; align-items: center; box-sizing: border-box; font-size: 20px;
        overflow-wrap: break-word;"
         v-if="vultureWallet.tokenStore != null && tokenData.tokenType == tokenTypes.ERC721">

        <div class="outline">
            <div style="width: 100%; margin-bottom: 5px;">
                <div style="font-size: 26px;">
                    <span class="accentColored">$</span>{{token.symbol}}
                    <span v-if="Number(token.balance) > 0">
                        &nbsp;-&nbsp;
                        <span class="accentColored">{{selectedTokenIndex}}</span> / <span class="accentColored">{{token.balance}}</span>
                    </span>
                </div>
                <hr>
            </div>
    
            <img v-if="NFTMetadata.image != '' && Number(token.balance) > 0" class="NFTImage" :src="NFTMetadata.image" @click="openImage()"/>

           <div class="infoSection" v-if="Number(token.balance) > 0">
                <div class="sectionTitleContainer" style="flex-direction: row;">
                    <div class="sectionDescription">
                        Metadata
                    </div>
                </div>

                <hr style="width: 100%">

                <div class="metadataParagraph" v-if="isMetadataLoading == false">
                    <span v-if="NFTMetadata.name != ''">
                        Name: <span class="accentColored"> {{NFTMetadata.name}} </span>
                        <hr class="smallerHr">
                    </span>

                    <span v-if="NFTMetadata.description != ''">
                        Description:
                        <span class="accentColored description"> {{NFTMetadata.description}} </span>
                        <hr class="smallerHr">
                    </span>
                        <span v-if="token.allTokenIds != null && token.allTokenIds.length > selectedTokenIndex - 1">
                        Token ID: <span class="accentColored"> {{token.allTokenIds[selectedTokenIndex - 1]}} </span>
                    </span>
                </div>
                <div v-else>
                    <div class="vultureLoader"> </div>
                </div>
            </div>
            <div class="infoSection" v-if="Number(token.balance) > 0" style="margin-bottom: auto;">

                <div class="sectionTitleContainer" style="flex-direction: row;">
                    <div class="sectionDescription">
                        Token Info 
                    </div>
                </div>

                <hr style="width: 100%">

                <div class="metadataParagraph">
                    NFT Name:
                    <span class="accentColored">
                        {{token.name}}
                        <hr class="smallerHr">
                    </span>
                    <div class="infoParagraph addressSection">
                        Token Address: <span class="accentColored addressText">{{token.address}}</span> <span class="fonticon">&#xe177;</span>
                        <br>
                    </div>
                </div>
            </div>

            <div class="infoSection" v-if="Number(token.balance) <= 0">
                <div style="text-align: center; font-size: 20px;">
                    This account has no <span class="accentColored">{{token.name}}</span>.
                </div>
            </div> 

            <div class="infoSection" v-if="Number(token.balance) <= 0" style="margin-bottom: auto;">
                <div class="sectionDescription">Token Info <hr> </div>
                <div class="metadataParagraph">
                NFT Name:
                <span class="accentColored">
                    {{token.name}}
                    <hr class="smallerHr">
                </span>
                    <div class="infoParagraph addressSection">
                        Token Address: <span class="accentColored addressText">{{token.address}}</span> <span class="fonticon">&#xe177;</span>
                        <br>
                    </div>
                </div>
            </div>


            <div class="infoSection" style="margin-bottom: auto;">
                <div class="flexBox" style="flex-direction: row; margin-top: 8px; align-items: center;">
                    <span class="fonticon" style="margin: 5px; margin-right: 10px; color: var(--warning_color); font-size: 25px;">&#xe002;</span>
                    <DefaultButton buttonHeight="30px" buttonWidth="150px" fontSize="17px" buttonText="Remove From List" @button-click="removeTokenFromList()"/>
                    <span class="fonticon" style="margin: 5px;  margin-left: 10px; color: var(--warning_color); font-size: 25px;">&#xe002;</span>
                </div>
                <i style="font-size: 13px;  color: var(--fg_color_2); margin-top: 10px; margin-bottom: 5px;" >
                    Remove this NFT from the NFT token list. You will have to re-add it to see it again in the wallet!
                </i>
            </div>

        </div>


        </div>

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 9px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="80px" buttonText="Back" @button-click="previousToken()"
            v-if="tokenData.tokenType == tokenTypes.ERC721 && Number(token.balance) > 0"/>
            <DefaultButton buttonHeight="40px" buttonWidth="120px" buttonText="Return" @button-click="quitModal()"/>

            <DefaultButton buttonHeight="40px" buttonWidth="80px" buttonText="Next" @button-click="nextToken()"
            v-if="tokenData.tokenType == tokenTypes.ERC721 && Number(token.balance) > 0"/>
        </div>
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount } from "../../vulture_backend/wallets/vultureWallet";
import { defineComponent, PropType, reactive, ref } from 'vue';
import { AbstractToken } from '@/vulture_backend/types/abstractToken';
import { VultureMessage } from "@/vulture_backend/vultureMessage";
import { TokenTypes } from "@/vulture_backend/types/tokenTypes";
import { fetchMetadata, ERC721Metadata} from "../../vulture_backend/utils/metadataFetch";
import { ModalEventSystem, ViewTokenInfoData } from "@/modalEventSystem";

export default defineComponent({
  name: "TokenViewModal",
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

    // For NFTs with unique token Id's 
    let selectedTokenIndex = ref(1);

    let tokenData: ViewTokenInfoData = props.modalSystem.getModalData() as ViewTokenInfoData;
    let tokenTypes = TokenTypes;

    let token: AbstractToken = reactive({
      address: '',
      decimals: 0,
      name: '!Error!',
      symbol: '',
      logoURI: '',
      balance: '0',
      allTokenIds: []
    });

    let NFTMetadata: ERC721Metadata = reactive({
        name: '',
        description: '',
        external_url: '',
        image: '',
        attributes: [],
    });

    let isMetadataLoading = ref(true);

    updateToken();

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function removeTokenFromList() {
        (props.vultureWallet as VultureWallet).removeTokenFromList(tokenData.tokenAddress, tokenData.tokenType);
        context.emit("reset-selected-token");
        quitModal();
    }
    function openImage() {
        window.open(NFTMetadata.image, '_blank');
    }
    function updateToken() {
        // Lots of ! here, too many, I know.
        switch(tokenData.tokenType) {
            case "ERC20": {
                token = props.vultureWallet.tokenStore.tokenList.get(props.vultureWallet.accountStore.currentlySelectedNetwork.networkUri)!.get(tokenData.tokenAddress)!;
                break;
            }
            case "ERC721": {
                token = props.vultureWallet.tokenStore.NFTList.get(props.vultureWallet.accountStore.currentlySelectedNetwork.networkUri)!.get(tokenData.tokenAddress)!;
                
                // Fetch more detailed data about the NFT other than the balance. Needed to get metadata to display for the user.
                props.vultureWallet.currentWallet!.infoWorker.onmessage = async (event) => {
                    if(event.data.method == VultureMessage.GET_TOKEN_DATA) {
                        if(event.data.params.success == true) {
                            if(event.data.params.tokenData.address == token.address) {
                                // Set the tokenIds this account owns for the current NFT.
                                token.allTokenIds = event.data.params.tokenData.allTokenIds;

                                // If the user has the NFT, we try to get metadata.
                                if(Number(token.balance) > 0) {
                                    // -- Get the metadata for the token now that we've gotten more details about the NFT tokenIDs.
                                    props.vultureWallet.currentWallet!.infoWorker.onmessage = async (event) => {
                                        if(event.data.method == VultureMessage.GET_TOKEN_METADATA) {
                                            if(event.data.params.success == true) {
                                                // Fetch data from the metadata URI that we've received from the worker.
                                                fetchMetadata(event.data.params.metadataURI, TokenTypes.ERC721).then((data) => {
                                                    NFTMetadata.name = (data as ERC721Metadata).name;
                                                    NFTMetadata.attributes = (data as ERC721Metadata).attributes;
                                                    NFTMetadata.description = (data as ERC721Metadata).description;
                                                    NFTMetadata.external_url = (data as ERC721Metadata).external_url;
                                                    NFTMetadata.image = (data as ERC721Metadata).image;
    
                                                    isMetadataLoading.value = false;
                                                });
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
                                            tokenId: token.allTokenIds![selectedTokenIndex.value - 1],
                                        }
                                    });
                                    // -- Get the metadata for the token now that we've gotten more details about the NFT tokenIDs.
                                }
                            }
                        }else {
                            console.error("Failed getting token data for NFT!");
                        }
                    };
                };
                // Tell the worker that we want token data.
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
                console.log("Token Type: " + tokenData.tokenType + " is not available!");
            }
        }
    }

    function nextToken() {
        if(selectedTokenIndex.value < Number(token.balance)) {
            selectedTokenIndex.value++;
            isMetadataLoading.value = true;
            updateToken();
        }
    }
    function previousToken() {
        if(selectedTokenIndex.value > 1) {
            selectedTokenIndex.value--;
            isMetadataLoading.value = true;
            updateToken();
        }
    }

    return {
        selectedTokenIndex,
        isMetadataLoading,
        NFTMetadata,
        tokenData,
        tokenTypes,

        removeTokenFromList: removeTokenFromList,
        previousToken: previousToken,
        updateToken: updateToken,
        quitModal: quitModal,
        nextToken: nextToken,
        openImage: openImage,
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
.fonticon {
    color: var(--fg_color_2);
    font-size: 20px;
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
.NFTImage {
    width: 82%;
    
    border-width: 2px;
    border-style: solid;
    border-radius: 12px;
    border-color: var(--bg_color_2);

    margin: 10px;

    


    user-select: none;
    transition-duration: 180ms;

    cursor: pointer;
}
.NFTImage:hover {
    transition-duration: 180ms;
    border-color: var(--accent_color);
}
.NFTImage:active {
    filter: brightness(80%);
    transition-duration: 180ms;
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
    font-size: 20px;
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
    font-size: 20px;
}
.addressSection {
    word-break: break-all;
}
.addressText {
    box-sizing: border-box;
    outline: none;
    font-size: 16px;
    outline-color: var(--bg_color_2);
    
    outline-width: 2px;
}
.metadataParagraph {
    width: 100%;
    text-align: left;
    font-size: 20px;
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
