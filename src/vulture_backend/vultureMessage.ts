export const VultureMessage = {
    /* Vault caching */
    "REQUEST_VAULT": "REQUEST_VAULT",
    "SET_VAULT":  "SET_VAULT",

    /* Wallet Management & Queries */
    "SET_CURRENT_WALLET": "SET_CURRENT_WALLET",
    "GET_ADDRESS_FROM_URI" : "GET_ADDRESS_FROM_URI",
    "GET_BALANCE_OF_ADDRESS": "GET_BALANCE_OF_ADDRESS",
    "SUBSCRIBE_TO_ACC_EVENTS": "SUBSCRIBE_TO_ACC_EVENTS",
    // This is necessary due to subscription to raw storage of contracts still being on-track.
    "ADD_TOKEN_TO_SUBSCRIPTION": "ADD_TOKEN_TO_SUBSCRIPTION",
    "TRANSFER_ASSETS": "TRANSFER_ASSETS",

    /* Staking And Nominating */
    "WITHDRAW_ALL_PAYOUTS": "WITHDRAW_ALL_PAYOUTS",
    "GET_VALIDATOR_LIST": "GET_VALIDATOR_LIST",
    "NOMINATE_VALIDATOR": "NOMINATE_VALIDATOR",
    "GET_STAKING_INFO": "GET_STAKING_INFO",
    "UNSTAKE_FUNDS": "UNSTAKE_FUNDS",
    "STAKE_FUNDS": "STAKE_FUNDS",

    // Will update the passed in key-pairs to be encoded in the correct cryptography & address format,
    // This method is used primarily when the user switches network (all accounts will need to be updated accordingally).
    "UPDATE_ACCOUNTS_TO_NETWORK": "UPDATE_ACCOUNTS_TO_NETWORK",

    // Will return information about any arbitrary asset such as ERC20/ERC721, or any asset depending on the network.
    "GET_TOKEN_DATA": "GET_TOKEN_DATA",
    "GET_TOKEN_BALANCE": "GET_TOKEN_BALANCE",
    "GET_TOKEN_METADATA": "GET_TOKEN_METADATA",


    /* Utilities */
    "IS_ADDRESS_VALID": "IS_ADDRESS_VALID",
    "ESTIMATE_TX_FEE": "ESTIMATE_TX_FEE",
}