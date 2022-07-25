
import { NetworkType } from "../../src/vulture_backend/types/networks/networkTypes";
import { VultureMessage } from "../../src/vulture_backend/vultureMessage";
import { VultureWallet } from "../../src/vulture_backend/wallets/vultureWallet";

import { AccountInfoHandler } from './apis/InetworkAPI';
import { SubstrateInfo } from './apis/substrate/substrateInfo';

/* -- Doc Note
 * accountInfoWorker.ts is a worker which is initialized with an address as well as info
 * of the current network; Afterwords the wallet may post requests for queries relevant to
 * this account such as the balance, tokens it possesses, staking info, etc.
 * 
 * This worker cannot send transactions or do anything that changes the state on behalf of a user/.
 */

var keylessWallet: AccountInfoHandler | null;


self.addEventListener("message", async (event) => {
    if(event.data && event.data.method) {
        switch(event.data.method as string) {
            // Set the current active wallet/account/network. Called once on start, and when switching wallet/network.
            case VultureMessage.SET_CURRENT_WALLET: {
                switch(event.data.params.networkType as NetworkType) {
                    case NetworkType.Substrate: {
                        keylessWallet = new SubstrateInfo(event.data.params.address, event.data.params.derivationPath, event.data.params.networkURI);
                        break;
                    }
                    case NetworkType.EVM: {
                        console.error("Ethereum VM Support not yet added!");
                        break;
                    }
                    default: {
                        console.error("Network " + event.data.params.networkType + " not supported yet!");
                        break;
                    }
                }
                break;
            }
            // Subscribes to events related to a given account address, such as balance changes.
            case VultureMessage.SUBSCRIBE_TO_ACC_EVENTS: {
                await keylessWallet?.subscribeToAddressEvents(event.data.params.address == null ? null : event.data.params.address);
                break;
            }
            // Calls many methods related to the tokenType to retrieve information about a token (smart contract methods).
            case VultureMessage.GET_TOKEN_DATA: {
                await keylessWallet?.getTokenData(event.data.params.tokenAddress, event.data.params.tokenType);
                break;
            }
            // Calls many methods related to the tokenType to retrieve information about a token (smart contract methods).
            case VultureMessage.GET_TOKEN_METADATA: {
                await keylessWallet?.getTokenMetadata(event.data.params.tokenAddress, event.data.params.tokenType, event.data.params.tokenId);
                break;
            }
            // Calls necessary method to get balance of a given token (smart contract methods).
            case VultureMessage.GET_TOKEN_BALANCE: {
                await keylessWallet?.getBalanceOfToken(event.data.params.tokenAddress, event.data.params.tokenType);
                break;
            }
            // Gets balance of a specific address.
            case VultureMessage.GET_BALANCE_OF_ADDRESS: {
                await keylessWallet?.getBalanceOf(event.data.params.address);
                break;
            }
            // Gets staking information for the passed in addresses.
            case VultureMessage.GET_STAKING_INFO: {
                await keylessWallet?.getStakingInfo(event.data.params.address, event.data.params.stakingAddress);
                break;
            }
            // Gets a list of validators along with their relevant staking info, such as their commission.
            case VultureMessage.GET_VALIDATOR_LIST: {
                await keylessWallet?.getValidatorInfo();
                break;
            }
            // Subscribes token address to changes, used to know when we should attempt to update balance. Quite inefficient since
            // it doesn't support raw storage subscriptions, but when that is supported it will be added.
            case VultureMessage.ADD_TOKEN_TO_SUBSCRIPTION: {
                await keylessWallet?.addTokenToSubscription(event.data.params.tokenAddress, event.data.params.tokenType);
                break;
            }
            // Checks if the address is valid/correct.
            case VultureMessage.IS_ADDRESS_VALID: {
                await keylessWallet?.validateAddress(event.data.params.address);
                break;
            }
            default: {
                console.log("Vulture accountInfoWorker does not have a '" + event.data.method + "' event, which was called.");
                break;
            }
        }
    }
});

postMessage({
    isReady: true
});