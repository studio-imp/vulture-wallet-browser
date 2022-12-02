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
        networkGradient: {
            hex1: "#b2fff2",
            hex2: "#c8ffa6"
        }
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
        networkGradient: {
            hex1: "#ff4f4f",
            hex2: "#ff98e3"
        }
    }
    public Polkadot: Network = {
        networkUri: 'wss://rpc.polkadot.io',
        networkAssetPrefix: 'DOT',
        networkName: 'Polkadot',
        networkAssetDecimals: 10,
        networkColor: '#e6007a',
        networkType: NetworkType.Substrate,
        networkFeatures: (NetworkFeatures.NONE),
        addressFormat: '0',
        isTestnet: false,
        networkGradient: {
            hex1: "#e8026d",
            hex2: "#ffa6d0"
        }
    }
    public Westend: Network = {
        networkUri: 'wss://westend-rpc.polkadot.io',
        networkAssetPrefix: 'WND',
        networkName: 'Westend',
        networkAssetDecimals: 12,
        networkColor: '#ffb67a',
        networkType: NetworkType.Substrate,
        networkFeatures: (NetworkFeatures.NONE),
        isTestnet: false,
        networkGradient: {
            hex1: "#e8026d",
            hex2: "#ffb67a"
        }
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
        networkGradient: {
            hex1: "#ffe8a6",
            hex2: "#dff9aa"
        }
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