import { mainnet, arbitrum, sepolia ,bsc,bscTestnet, base, baseSepolia, sonic, sonicTestnet, polygon, avalanche, zksync, coreDao, xLayer, linea, blast, berachain, polygonAmoy, solana, optimism} from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { core } from 'web3'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
// import { mainnet, arbitrum, sepolia, bsc } from '@reown/appkit' // adjust import path as needed

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "1e8fbe566ab223dac6fd8f4e0fdbf82c" // this is a public projectId only to use on localhost
console.log("Current projectId", projectId)
if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Create a metadata object - optional
export const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://reown.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [mainnet, arbitrum, sepolia,bsc,bscTestnet, base, baseSepolia,sonic,sonicTestnet,polygon,avalanche,zksync,coreDao,xLayer,linea,blast,berachain, polygonAmoy, solana,optimism] as [AppKitNetwork, ...AppKitNetwork[]]

export const solanaWeb3JsAdapter = new SolanaAdapter()
// Set up Solana Adapter
export const ethersAdapter = new EthersAdapter();