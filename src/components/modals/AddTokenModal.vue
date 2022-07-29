<template>

    <!-- TODO: seperate NFTs and ERC20 to seperate components. The modal system needs a bit of refactoring clearly -->

    <!---------------------------------- TOKEN BOX ---------------------------------->
    <div class="flexBox" style="height: 100%; width: 100%;">
        <div class="flexBox" style="flex-grow: 1; padding-left: 8px; padding-right: 8px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 30px; box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word" v-if="tokenTypeToAdd == 'ERC20'">
        <div style="margin-bottom: 5px;">
            <DefaultInput @on-enter="setAddress($event)" inputWidth="315px" inputHeight="40px" fontSize="15px" inputName="Token Address" inputPlaceholder="Enter Token Address"/>
        </div>
            <div class="outline" style=" text-align: left; font-size: 18px; height: auto; text-align: center; width: 90%;">
                <div v-if="tokenDiscoveryStatus == 'EnterAddress'">    
                    Please enter a Token Address.
                    Only add tokens that you've
                    <span style="color: var(--accent_color); text-shadow: 0px 0px 5px var(--accent_color); ">
                    verified.
                    </span>
                    <div class="infoText">
                        Feel free to read our <a href="https://docs.vulturewallet.net/scams" target="_blank">scam-protection</a> guide.
                        Educate yourself and others.
                    </div>
                </div>

                <div v-if="tokenDiscoveryStatus == 'InvalidAddress'">    
                    The token address entered is Invalid! <br>
                    <span style="color: rgb(0, 180, 255); text-shadow: 0px 0px 7px rgb(0, 180, 255); font-size: 15px;">
                    (╥﹏╥)
                    </span>
                </div>

                <div v-if="tokenDiscoveryStatus == 'InvalidToken'" class="flexBox" style="width: 100%; flex-direction: column; width: 100%; align-items: center;">    
                    <span style="color: rgb(255, 0, 65); text-shadow: 0px 0px 5px rgb(255, 0, 65); margin-bottom: 5px;">
                    Error: <span style="color: var(--fg_color); text-shadow: 0px 0px 0px;"> {{error}} </span>
                    </span>
                    <hr>
                    <div style="display: flex; flex-direction: column; width: 100%; margin-top: 5px; margin-bottom: 5px;">
                    Maybe try a different one?
                        <div style="color: rgb(0, 180, 255); text-shadow: 0px 0px 7px rgb(0, 180, 255); font-size: 15px;">
                            (╥﹏╥)
                        </div>
                    </div>
                </div>

                <div class="flexBox" style="width: 100%;" v-if="tokenDiscoveryStatus == 'TokenFound'">
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        Name: <span style="color: var(--accent_color)">{{currentToken.name}}</span>
                        [<span style="font-size: 14px; color: var(--accent_color);"> ${{currentToken.symbol}}</span> ]
                        <hr>
                    </div>
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        Your Balance: <span style="color: var(--accent_color)">{{currentToken.balance}}</span> 
                        <hr>
                    </div>
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        Supply: <span style="color: var(--accent_color)">{{currentToken.totalSupply}}</span> <br>
                        <i style="font-size: 13px;  color: var(--fg_color_2)">Total supply of the Token.</i>
                        <hr>
                    </div>
                    <div  style="width: 100%; text-align: left; margin-top: 20px;">
                        Address: <span style="color: var(--accent_color); font-size: 15px;">{{currentToken.address}}</span> <br>
                        <i style="font-size: 13px;  color: var(--fg_color_2)">Unique Address of the Token.</i>
                        <hr>
                    </div>
                </div>

                <div class="vultureLoader" v-if="showLoader == true"></div>
            </div>

            <div>
                <div class="birdsOnBranch" v-if="tokenDiscoveryStatus == 'EnterAddress' || tokenDiscoveryStatus == 'InvalidAddress' ">
                    <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="250" viewBox="0, 0, 400,400" version="1.1"><g id="svgg"><path id="path0" d="M135.943 117.049 C 128.067 119.269,118.035 127.226,117.077 132.013 C 116.784 133.482,114.794 136.224,111.997 139.014 C 103.934 147.057,100.366 161.992,102.778 177.600 C 105.421 194.706,106.460 198.545,110.785 207.199 C 113.094 211.820,115.240 217.349,115.554 219.487 L 116.124 223.375 110.262 222.822 C 79.319 219.903,76.654 219.102,63.665 208.818 C 55.268 202.169,52.800 200.922,52.800 203.329 C 52.800 204.780,70.435 222.735,73.359 224.259 C 77.158 226.241,84.517 227.664,98.800 229.180 C 105.400 229.880,111.880 230.623,113.200 230.830 L 115.600 231.207 115.807 254.544 C 116.036 280.428,115.874 279.385,119.273 276.872 C 121.439 275.271,122.004 275.173,124.089 276.037 C 125.388 276.575,126.603 276.864,126.788 276.678 C 127.363 276.104,131.140 250.452,131.937 241.721 C 132.352 237.167,132.828 233.305,132.995 233.138 C 133.394 232.739,177.071 237.238,188.400 238.844 C 205.127 241.216,205.751 241.795,212.910 261.600 C 220.670 283.072,221.543 280.168,197.515 312.800 C 173.839 344.954,174.403 344.000,179.085 344.000 C 181.842 344.000,182.674 343.121,203.706 318.000 C 235.528 279.990,233.886 284.683,223.600 261.131 C 213.985 239.116,213.340 240.914,232.196 237.169 C 249.899 233.654,254.093 233.639,335.600 236.800 C 369.480 238.114,397.830 239.191,398.600 239.194 C 399.742 239.199,400.000 238.484,400.000 235.323 L 400.000 231.446 386.740 230.975 C 364.862 230.200,364.856 233.805,386.814 179.651 L 400.055 146.992 399.828 139.296 L 399.600 131.600 381.709 170.000 C 352.137 233.472,357.246 228.483,322.090 228.223 C 295.393 228.025,297.307 228.275,298.409 225.130 C 300.141 220.181,306.015 218.853,314.006 221.602 C 321.486 224.176,320.782 221.857,312.740 217.437 C 309.404 215.603,308.298 214.605,308.855 213.934 C 309.734 212.875,307.821 211.028,298.572 204.001 C 295.387 201.582,292.589 199.062,292.353 198.401 C 291.102 194.893,285.358 191.813,281.212 192.427 C 279.006 192.755,275.130 193.040,272.600 193.061 C 267.582 193.103,267.061 193.550,269.800 195.460 C 271.588 196.708,271.582 196.716,268.840 196.758 C 265.604 196.807,266.299 197.791,270.522 199.140 C 273.844 200.200,274.900 202.581,273.584 206.043 C 271.922 210.413,273.709 215.151,279.311 221.228 C 284.145 226.472,283.280 226.760,262.494 226.826 C 246.110 226.877,244.548 227.018,232.800 229.506 C 223.139 231.552,218.526 232.127,211.916 232.107 C 204.795 232.085,136.909 225.895,136.152 225.198 C 136.015 225.073,138.260 220.266,141.141 214.518 C 153.227 190.400,156.530 174.269,153.197 155.641 C 149.653 135.837,150.168 133.561,159.397 128.238 C 166.767 123.987,166.837 123.178,159.945 121.968 C 157.115 121.472,153.121 120.093,151.070 118.903 C 146.611 116.319,140.983 115.629,135.943 117.049 M295.003 225.800 C 294.797 226.426,292.750 226.891,289.537 227.042 C 283.402 227.332,283.814 225.862,290.000 225.392 C 292.200 225.225,294.300 225.024,294.667 224.944 C 295.033 224.865,295.185 225.250,295.003 225.800 " stroke="none" fill-rule="evenodd"></path></g></svg>
                </div>
            </div>
        </div>

        <!---------------------------------- NFT BOX ---------------------------------->
        <div class="flexBox" style="flex-grow: 1; padding-left: 8px; padding-right: 8px; width: 100%;
        flex-direction: column; align-items: center; margin-top: 30px; box-sizing: border-box; font-size: 18px;
        overflow-wrap: break-word" v-if="tokenTypeToAdd == 'ERC721'">
            <div style="margin-bottom: 5px;">
            <DefaultInput @on-enter="setAddress($event)" inputWidth="315px" inputHeight="40px" fontSize="15px" inputName="NFT Address" inputPlaceholder="Enter NFT Address"/>
            </div>
            <div class="outline" style=" text-align: left; font-size: 18px; height: auto; text-align: center; width: 90%;">
                <div v-if="tokenDiscoveryStatus == 'EnterAddress'">    
                    Please enter a NFT address.
                    Only add tokens that you've 
                    <span style="color: var(--accent_color); text-shadow: 0px 0px 5px var(--accent_color); ">
                    verified.
                    </span>

                    <div class="infoText">
                        Feel free to read our <a href="https://docs.vulturewallet.net/scams" target="_blank">scam-protection</a> guide.
                        Educate yourself and others.
                    </div>
                </div>

                <div v-if="tokenDiscoveryStatus == 'InvalidAddress'">    
                    The token address entered is Invalid! <br>
                    <span style="color: rgb(0, 180, 255); text-shadow: 0px 0px 7px rgb(0, 180, 255); font-size: 15px;">
                    (╥﹏╥)
                    </span>
                </div>

                <div v-if="tokenDiscoveryStatus == 'InvalidToken'" class="flexBox" style="width: 100%; flex-direction: column; width: 100%; align-items: center;">    
                    <span style="color: rgb(255, 0, 65); text-shadow: 0px 0px 5px rgb(255, 0, 65); margin-bottom: 5px;">
                    Error: <span style="color: var(--fg_color); text-shadow: 0px 0px 0px;"> {{error}} </span>
                    </span>
                    <hr>
                    <div style="display: flex; flex-direction: column; width: 100%; margin-top: 5px; margin-bottom: 5px;">
                    Maybe try a different one?
                        <div style="color: rgb(0, 180, 255); text-shadow: 0px 0px 7px rgb(0, 180, 255); font-size: 15px;">
                            (╥﹏╥)
                        </div>
                    </div>
                </div>

                <div class="flexBox" style="width: 100%;" v-if="tokenDiscoveryStatus == 'TokenFound'">
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        Name: <span style="color: var(--accent_color)">{{currentToken.name}}</span>
                        [<span style="font-size: 14px; color: var(--accent_color);"> ${{currentToken.symbol}}</span> ]
                        <hr>
                    </div>
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        This account has: <span style="color: var(--accent_color)">{{currentToken.balance}}</span>
                        <span style="font-size: 14px; color: var(--accent_color);"> ${{currentToken.symbol}}</span> NFTs
                        <hr>
                    </div>
                    <div style="width: 100%; text-align: left; margin-top: 15px;">
                        Total Supply: <span style="color: var(--accent_color)">{{currentToken.totalSupply}}</span> <br>
                        <i style="font-size: 13px;  color: var(--fg_color_2)">Total supply of the NFT collection.</i>
                        <hr>
                    </div>
                    <div  style="width: 100%; text-align: left; margin-top: 20px;">
                        Address: <span style="color: var(--accent_color); font-size: 15px;">{{currentToken.address}}</span> <br>
                        <i style="font-size: 13px;  color: var(--fg_color_2)">Unique Address of the Token.</i>
                        <hr>
                    </div>
                </div>

                <div class="vultureLoader" v-if="showLoader == true"></div>
            </div>

            <div class="birdsOnBranch" v-if="tokenDiscoveryStatus == 'EnterAddress' || tokenDiscoveryStatus == 'InvalidAddress'">
                <svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="250" viewBox="0, 0, 400,400" version="1.1"><g id="svgg"><path id="path0" d="M135.943 117.049 C 128.067 119.269,118.035 127.226,117.077 132.013 C 116.784 133.482,114.794 136.224,111.997 139.014 C 103.934 147.057,100.366 161.992,102.778 177.600 C 105.421 194.706,106.460 198.545,110.785 207.199 C 113.094 211.820,115.240 217.349,115.554 219.487 L 116.124 223.375 110.262 222.822 C 79.319 219.903,76.654 219.102,63.665 208.818 C 55.268 202.169,52.800 200.922,52.800 203.329 C 52.800 204.780,70.435 222.735,73.359 224.259 C 77.158 226.241,84.517 227.664,98.800 229.180 C 105.400 229.880,111.880 230.623,113.200 230.830 L 115.600 231.207 115.807 254.544 C 116.036 280.428,115.874 279.385,119.273 276.872 C 121.439 275.271,122.004 275.173,124.089 276.037 C 125.388 276.575,126.603 276.864,126.788 276.678 C 127.363 276.104,131.140 250.452,131.937 241.721 C 132.352 237.167,132.828 233.305,132.995 233.138 C 133.394 232.739,177.071 237.238,188.400 238.844 C 205.127 241.216,205.751 241.795,212.910 261.600 C 220.670 283.072,221.543 280.168,197.515 312.800 C 173.839 344.954,174.403 344.000,179.085 344.000 C 181.842 344.000,182.674 343.121,203.706 318.000 C 235.528 279.990,233.886 284.683,223.600 261.131 C 213.985 239.116,213.340 240.914,232.196 237.169 C 249.899 233.654,254.093 233.639,335.600 236.800 C 369.480 238.114,397.830 239.191,398.600 239.194 C 399.742 239.199,400.000 238.484,400.000 235.323 L 400.000 231.446 386.740 230.975 C 364.862 230.200,364.856 233.805,386.814 179.651 L 400.055 146.992 399.828 139.296 L 399.600 131.600 381.709 170.000 C 352.137 233.472,357.246 228.483,322.090 228.223 C 295.393 228.025,297.307 228.275,298.409 225.130 C 300.141 220.181,306.015 218.853,314.006 221.602 C 321.486 224.176,320.782 221.857,312.740 217.437 C 309.404 215.603,308.298 214.605,308.855 213.934 C 309.734 212.875,307.821 211.028,298.572 204.001 C 295.387 201.582,292.589 199.062,292.353 198.401 C 291.102 194.893,285.358 191.813,281.212 192.427 C 279.006 192.755,275.130 193.040,272.600 193.061 C 267.582 193.103,267.061 193.550,269.800 195.460 C 271.588 196.708,271.582 196.716,268.840 196.758 C 265.604 196.807,266.299 197.791,270.522 199.140 C 273.844 200.200,274.900 202.581,273.584 206.043 C 271.922 210.413,273.709 215.151,279.311 221.228 C 284.145 226.472,283.280 226.760,262.494 226.826 C 246.110 226.877,244.548 227.018,232.800 229.506 C 223.139 231.552,218.526 232.127,211.916 232.107 C 204.795 232.085,136.909 225.895,136.152 225.198 C 136.015 225.073,138.260 220.266,141.141 214.518 C 153.227 190.400,156.530 174.269,153.197 155.641 C 149.653 135.837,150.168 133.561,159.397 128.238 C 166.767 123.987,166.837 123.178,159.945 121.968 C 157.115 121.472,153.121 120.093,151.070 118.903 C 146.611 116.319,140.983 115.629,135.943 117.049 M295.003 225.800 C 294.797 226.426,292.750 226.891,289.537 227.042 C 283.402 227.332,283.814 225.862,290.000 225.392 C 292.200 225.225,294.300 225.024,294.667 224.944 C 295.033 224.865,295.185 225.250,295.003 225.800 " stroke="none" fill-rule="evenodd"></path></g></svg>
            </div>

        </div>

        

        <div class="flexBox" style="flex-grow: 0; margin-bottom: 15px; width: 100%; flex-direction: row; align-self: center; justify-content: space-evenly;">
            <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Return" @button-click="quitModal()"/>
            <span v-if="tokenDiscoveryStatus == 'TokenFound'">
                <DefaultButton buttonHeight="40px" buttonWidth="150px" buttonText="Add" @button-click="addToken()"/>
           </span>
        </div>
            
    </div>
</template>

<script lang="ts">
import DefaultButton from "../building_parts/DefaultButton.vue";
import DefaultInput from "../building_parts/DefaultInput.vue"
import DropdownSelection from "../building_parts/DropdownSelection.vue";
import { VultureWallet, createNewAccount, WalletType} from "../../vulture_backend/wallets/vultureWallet";
import { AbstractToken } from "../../vulture_backend/types/abstractToken";
import { VultureMessage } from "../../vulture_backend/vultureMessage";
import { defineComponent, PropType, reactive, ref, Ref } from 'vue';
import { DefaultNetworks } from "@/vulture_backend/types/networks/network";
import { AddTokenData, ModalEventSystem } from "@/modalEventSystem";

export default defineComponent({
  name: "AddTokenModal",
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
    let currentAddress = ref("");
    let tokenDiscoveryStatus = ref("EnterAddress");
    
    let showLoader = ref(false);

    let tokenTypeToAdd = ref((props.modalSystem.getModalData() as AddTokenData).tokenType);

    let token: AbstractToken = {
      network: new DefaultNetworks().AlephZero,
      address: '',
      decimals: 0,
      balance: '0',
      name: '',
      symbol: '',
      logoURI: '',
      metadataURI: undefined
    };
    let error = ref("");
    let currentToken = ref(token);

    function quitModal() {
        props.modalSystem.closeModal();
    }
    function setAddress(address: string) {
        currentAddress.value = address;
        if(currentAddress.value == "") {
            tokenDiscoveryStatus.value = "EnterAddress";
            showLoader.value = false;
            return;
        }
        props.vultureWallet.currentWallet.accountEvents.once(VultureMessage.IS_ADDRESS_VALID, (isValid) => {
            if(isValid == true) {
                tokenDiscoveryStatus.value = "Loading";
                showLoader.value = true;
                
                //Get the token information and display it if the address matches a token.
                props.vultureWallet.currentWallet.accountEvents.once(VultureMessage.GET_TOKEN_DATA, (data) => {
                    if(data.params.success == true) {
                        tokenDiscoveryStatus.value = "TokenFound";
                        showLoader.value = false;
                        let selectedToken: AbstractToken = {
                          network: props.vultureWallet.accountStore.currentlySelectedNetwork,
                          address: address,
                          decimals: props.vultureWallet.accountStore.currentlySelectedNetwork.networkAssetDecimals, //this is temporary for now...
                          name: data.params.tokenData.name,
                          totalSupply: data.params.tokenData.totalSupply,
                          symbol: data.params.tokenData.symbol,
                          logoURI: data.params.tokenData.logoURI,
                          balance: data.params.tokenData.balance,
                          metadataURI: data.params.tokenData.metadataURI,
                        }
                        currentToken.value = selectedToken;
                        // set currentToken.token to the token, 
                    }else {
                        showLoader.value = false;
                        tokenDiscoveryStatus.value = "InvalidToken";
                        error.value = data.params.error;
                    }
                });
                props.vultureWallet.currentWallet.getTokenInformation(address, tokenTypeToAdd.value);
                
            }else {
                tokenDiscoveryStatus.value = "InvalidAddress";
                showLoader.value = false;
            }
        });
        props.vultureWallet.currentWallet.isAddressValid(currentAddress.value);
    }
    function addToken() {
        if(tokenDiscoveryStatus.value == "TokenFound") {
            props.vultureWallet.addTokenToList(currentToken.value, tokenTypeToAdd.value);
        }
        props.modalSystem.closeModal();
    }
    return {
        tokenDiscoveryStatus,
        tokenTypeToAdd,
        showLoader,
        currentToken,
        error,

        quitModal: quitModal,
        setAddress: setAddress,
        addToken: addToken,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
hr {
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
    border: none;
    height: 1px;
    background-color: var(--fg_color_2);
}

.birdsOnBranch {
    position: absolute;
    top: 220px;
    left: 100px;
    fill: rgba(0,0,0,0.2);
}
.infoText {
    margin: 10px;
    padding: 2px;
    color: var(--fg_color_2);
    font-size: 15px;
}
.outline {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 12px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--bg_color_2);
    padding: 12px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin: 10px;
    margin-top: 0px;

    flex-wrap: wrap;

    max-height: 346px;
    
    overflow: hidden;
    overflow-y: auto;
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
