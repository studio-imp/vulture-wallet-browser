
/** ## NetworkType
 * The network type of a network, the value in this enum represents how the wallet handles the data/accounts/cryptography
 * of the network. If the user adds a custom network (with a custom RPC), it is important that they select a network type
 * that's corret.
 * 
 * There may also be additional specific network types, such as `SubstrateNetworks`; this is due to the fact that substrate
 * networks may have different properties which are unique, and cannot be general.
 */
 export enum NetworkType {
    Substrate,
    Solana,
    EVM,
}

export enum NetworkFeatures {
    NONE = 0,
    STAKING = 1 << 0,
    SMART_CONTRACTS = 1 << 1,
}

export interface Network {
    /** ## networkUri
     * The Websocket URI to the network node. 
     */
    networkUri: string;
    networkAssetPrefix: string;
    networkName: string;
    networkAssetDecimals: number;
    /** ## networkColor
    * A hex value of the color-theme of the network (mainly here for front-end visual purposes)...
    */
    networkColor: string;
    networkLogoUri?: string;
    networkType: NetworkType;
    /** # addressFormat
     * Some networks which are multi-chain, or use certain SDKs such as Substrate may
     * have multiple address encoding/formats to differentiate between the different
     * chains. In the case of Substrate, this is true with the `ss58` format.
     * 
     * ## Substrate:
     * If the networkType is substrate, the address format should be the `ss58` prefix
     * number, if left undefined, this will default to the default substrate address format.
     * A list of ss58 prefixes can be found in the [ss58 registry](https://github.com/paritytech/ss58-registry/blob/main/ss58-registry.json)
     * 
     */
    addressFormat?: string
    isTestnet: boolean,

    /** ## networkFeatures
     * An enum bitfield representing the features a network has. Interact with this enum as a **bitfield**!
     */
    networkFeatures: NetworkFeatures

}