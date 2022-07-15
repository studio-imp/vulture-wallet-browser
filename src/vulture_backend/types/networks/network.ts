import { Network, NetworkFeatures, NetworkType } from "./networkTypes"

export class DefaultNetworks {
    /* -- Main Networks -- */
    public AlephZero: Network = {
        networkUri: 'wss://ws.azero.dev',
        networkAssetPrefix: 'AZERO',
        networkName: 'Aleph Zero',
        networkAssetDecimals: 12,
        networkColor: '#00EAC7',
        networkType: NetworkType.Substrate,
        isTestnet: false,
        networkFeatures: (NetworkFeatures.STAKING),
    }
    public Kusama: Network = {
        networkUri: 'wss://kusama-rpc.polkadot.io',
        networkAssetPrefix: 'KSM',
        networkName: 'Kusama',
        networkAssetDecimals: 12,
        networkColor: '#e8026d',
        networkType: NetworkType.Substrate,
        networkFeatures: (NetworkFeatures.NONE),
        addressFormat: '2',
        isTestnet: false,
    }
    public Polkadot: Network = {
        networkUri: 'wss://kusama-rpc.polkadot.io',
        networkAssetPrefix: 'DOT',
        networkName: 'Polkadot',
        networkAssetDecimals: 10,
        networkColor: '#e6007a',
        networkType: NetworkType.Substrate,
        networkFeatures: (NetworkFeatures.NONE),
        addressFormat: '0',
        isTestnet: false,
    }
    /* 
    public AvalancheCChain: Network = {
        networkUri: 'https://api.avax.network:443',
        networkAssetPrefix: 'AVAX',
        networkName: 'Avax C-Chain',
        networkAssetDecimals: 18,
        networkColor: '#ff0043',
        networkType: NetworkType.EVM,
        isTestnet: false,
    }
     */
    /* -- Test Networks -- */
    public AlephZeroTestNet: Network = {
        networkUri: 'wss://ws.test.azero.dev',
        networkAssetPrefix: 'TZERO',
        networkName: 'Aleph Zero Testnet',
        networkAssetDecimals: 12,
        networkColor: '#98ea79',
        networkType: NetworkType.Substrate,
        networkFeatures: (NetworkFeatures.STAKING | NetworkFeatures.SMART_CONTRACTS),
        isTestnet: true,
    }
    public allNetworks: Map<string, Network> = new Map([
        [
            this.AlephZero.networkName,
            this.AlephZero
        ],
        [
            this.Kusama.networkName,
            this.Kusama
        ],
        [
            this.Polkadot.networkName,
            this.Polkadot
        ],
        /*
        [
            this.AvalancheCChain.networkName,
            this.AvalancheCChain
        ],
         */
        [
            this.AlephZeroTestNet.networkName,
            this.AlephZeroTestNet
        ],
    ]);
    public mainNets: Map<string, Network> = new Map([
        [
            this.AlephZero.networkName,
            this.AlephZero
        ],
        [
            this.Kusama.networkName,
            this.Kusama
        ],
        [
            this.Polkadot.networkName,
            this.Polkadot
        ],
    ]);
    public testNets: Map<string, Network> = new Map([
        [
            this.AlephZeroTestNet.networkName,
            this.AlephZeroTestNet
        ],
    ]);
}