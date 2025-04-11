import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount, useAppKitProvider, useAppKitNetworkCore, type Provider } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner, parseUnits, formatEther, Contract } from 'ethers'
import { networks } from '../config'
import { grantPermissions, type SmartSessionGrantPermissionsRequest } from '@reown/appkit-experimental/smart-session'
import { toHex } from 'viem'
import { useState } from 'react'
import { prepareCalls, sendPreparedCalls } from '../utils/UserOpBuilderServiceUtils'
import { encodeTokenTransfer } from '../utils/tokenTransferUtils'
import { signMessage } from "viem/accounts";

interface ActionButtonListProps {
  sendHash: (hash: string) => void;
  sendSignMsg: (hash: string) => void;
  sendBalance: (balance: string) => void;

}

export const ActionButtonList = ({ sendHash, sendSignMsg, sendBalance }: ActionButtonListProps) => {
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  // const { chainId } = useAppKitNetworkCore();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const [networkIndex, setNetworkIndex] = useState('')

  let contractForNetwork = {
   "11155111":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99", // Spoila Eth
   "97":"0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet
   "56":"0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet
   "1":"0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
   "42161":"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum Mainnet
   "8453":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet
   "84532":"0x4A8b94f3A315E9961c177f377031dF79bf14bEE5", // Base Sepolia
   "146":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",// Sonic Mainnet
   "64165":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",// Sonic Testnet
   "137":"0x74D8f222D3b8c173C24aD188f6B538159eE0F270", // Polygon Mainnet
   "43114":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99", //Avalanche Mainnet
   "324":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99", //ZkSync Mainnet
   "1116":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//CoreDao Mainnet
   "196":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//Xlayer Mainnet
   "59144":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//Linea Mainnet
   "13711155111":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//Polygon Amoy
   "101":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//Solana Mainnet
   "10":"0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",//Optimism Mainnet
  
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };
 

  // function to sing a msg 
  // const handleSignMsg = async () => {
  //   if (!walletProvider || !address) throw Error('user is disconnected');

  //   const provider = new BrowserProvider(walletProvider, chainId);
  //   const signer = new JsonRpcSigner(provider, address);
  //   const sig = await signer?.signMessage('Hello Reown AppKit!');

  //   sendSignMsg(sig);
  // }

  // function to get the balance
  const handleGetBalance = async () => {
    if (!walletProvider || !address) throw Error('user is disconnected')

    const provider = new BrowserProvider(walletProvider, chainId)
    const balance = await provider.getBalance(address);
    const eth = formatEther(balance);
    sendBalance(`${eth} ETH`);
  }



  // const handleTransferRequestPermision = async()=>{
  //   try {
  //     if (!walletProvider || !address) throw Error('user is disconnected');
  //     console.log("walletProvider: ", walletProvider)
  //     console.log("chainId: ", chainId)
  //     console.log("address: ", address)
  //     let chas = chainId ? toHex(chainId) :'12';
  //     console.log("chas: ", chas)

  //     const request: SmartSessionGrantPermissionsRequest = {
  //       expiry: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days in seconds
  //       chainId:chainId ? toHex(chainId) :'0xaa36a7',
  //       address:address as `0x${string}`,
  //       signer: {
  //         type: 'keys',
  //         data: {
  //           keys: [{
  //             type: 'secp256k1',
  //             publicKey:address as `0x${string}` //public key of dapp signer
  //           }]
  //         }
  //       },
  //       permissions: [{
  //         type: 'contract-call',
  //         data: {
  //           address:  contractForNetwork[chainId ? chainId.toString() as keyof typeof contractForNetwork : '97'] as `0x${string}` , // USDTcontract address
  //           abi: [
  //             {
  //               "constant": false,
  //               "inputs": [
  //                 {
  //                   "internalType": "address",
  //                   "name": "recipient",
  //                   "type": "address"
  //                 },
  //                 {
  //                   "internalType": "uint256",
  //                   "name": "amount",
  //                   "type": "uint256"
  //                 }
  //               ],
  //               "name": "transfer",
  //               "outputs": [
  //                 {
  //                   "internalType": "bool",
  //                   "name": "",
  //                   "type": "bool"
  //                 }
  //               ],
  //               "payable": false,
  //               "stateMutability": "nonpayable",
  //               "type": "function"
  //             }
  //           ],
  //           functions: [{
  //             functionName: 'transfer'
  //           }]
  //         }
  //       }],
  //       policies: []
  //     }
  //     console.log("What is request: ", request)
  //     const response = await grantPermissions(request)
  //     console.log("Its Happening To Get Grant Permision of Transaction")
  //     console.log("Is it throwing any Error", response)
  //   } catch (err) {
  //     console.log("This error is happening: ", err)
  //   }
  // }
  const handlePrepareCalls = async()=>{
    try {
      if (!walletProvider || !address) throw Error('user is disconnected');
      let chas = chainId ? toHex(chainId) : '0xaa36a7';
      // First get the permissions
      const request: SmartSessionGrantPermissionsRequest = {
        expiry: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days in seconds
        chainId: chas,
        address: address as `0x${string}`,
        signer: {
          type: 'keys',
          data: {
            keys: [{
              type: 'secp256k1',
              publicKey:"0x48C06E8c0dbaAE2d284971Fa73D27288118b5FdF", //address as `0x${string}`
            }]
          }
        },
        permissions: [{
          type: 'contract-call',
          data: {
            address: contractForNetwork[chainId ? chainId.toString() as keyof typeof contractForNetwork : '97'] as `0x${string}`,// USDT Contract Address
            abi: [
              {
                "constant": false,
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  }
                ],
                "name": "transfer",
                "outputs": [
                  {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                  }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ],
            functions: [{
              functionName: 'transfer'
            }]
          }
        }],
        policies: []
      };
      const permissionsResponse = await grantPermissions(request);
      console.log("Permision Response", permissionsResponse)
      // Encode the token transfer
      const provider = new BrowserProvider(walletProvider, chainId);
      const encodedTransfer = await encodeTokenTransfer(provider, {
        tokenAddress: contractForNetwork[chainId ? chainId.toString() as keyof typeof contractForNetwork : '97'] as `0x${string}`, //  USDT contract address
        recipientAddress: "0x0C3F6e88aD57473Ca2ae8a8C5CAFD6b270F98999" as `0x${string}`,
        amount: "1", // 1 USDT
        fromAddress: address as `0x${string}`
      });

      // Now prepare the calls with the granted permissions
      let args = {
        from: address as `0x${string}`,
        chainId: chas,
        calls: [{
          to: encodedTransfer.to,
          data: encodedTransfer.data,
          value: encodedTransfer.value
        }],
        capabilities: {
          permissions: {
            context: permissionsResponse.context 
          }
        }
      };

      console.log("Preparing calls with args:", args);
      let preparedCalls = await prepareCalls(args);
      const response = preparedCalls[0];
      if (!response || response.preparedCalls.type !== "user-operation-v07") {
        throw new Error("Invalid response type");
      }

      const signatureRequest = response.signatureRequest;
      const privateKey = import.meta.env.VITE_ECDSA_PRIVATE_KEY;
      // console.log("Private Key:", privateKey);
      
      if (!privateKey) {
        throw new Error("ECDSA private key is not configured");
      }

      const dappSignature = await signMessage({
        privateKey: privateKey as `0x${string}`,
        message: { raw: signatureRequest.hash },
      });
      const sendPreparedCallsResponse = await sendPreparedCalls({
        context: response.context,
        preparedCalls: response.preparedCalls,
        signature: dappSignature,
      });
    
      const userOpIdentifier = sendPreparedCallsResponse[0];


    } catch (error) {
      // const errorMessage = error instanceof Error ? error.message.split('\n')[0] : 'Unknown error occurred';
      console.error("Error in handlePrepareCalls:", error);
    }
  }

  // const handleRequestPermission1 = async () => {
  //   try {
  //     if (!walletProvider || !address) throw Error('user is disconnected');
  
  //     const request: SmartSessionGrantPermissionsRequest = {
  //       expiry: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 days in seconds
  //       chainId: chainId ? toHex(chainId) :'0xaa36a7',
  //       address: address as `0x${string}`,
  //       signer: {
  //         type: 'keys',
  //         data: {
  //           keys: [{
  //             type: 'secp256k1',
  //             publicKey: address as `0x${string}`
  //           }]
  //         }
  //       },
  //       permissions: [{
  //         type: 'contract-call',
  //         data: {
  //           address: '0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99', // USDT contract
  //           abi: [
  //             {
  //               constant: false,
  //               inputs: [
  //                 {
  //                   name: "recipient",
  //                   type: "address"
  //                 },
  //                 {
  //                   name: "amount",
  //                   type: "uint256"
  //                 }
  //               ],
  //               name: "transfer",
  //               outputs: [{ type: "bool", name: "" }],
  //               payable: false,
  //               stateMutability: "nonpayable",
  //               type: "function"
  //             }
  //           ],
  //           functions: [{
  //             functionName: 'transfer'
  //           }]
  //         }
  //       }],
  //       policies: []
  //     };
  
  //     console.log("Requesting permissions with:", request);
  //     const response = await grantPermissions(request);
  //     console.log("Permission granted:", response);
      
  //     // You might want to store the response for later use
  //     return response;
  //   } catch (error) {
  //     console.error("Smart session error:", error);
  //     throw error;
  //   }
  // };

  return (
    <div>
      {isConnected ? (
        <div>
          <button onClick={() => open()}>Open</button>
          <button onClick={handleDisconnect}>Disconnect</button>
        
          {/* <button onClick={handleSignMsg}>Sign msg</button> */}
          <button onClick={handleGetBalance}>Get Balance</button>
          {/* <button onClick={handleRequestPermission1}>Request Permission</button> */}
          {/* <button onClick={handleTransferRequestPermision}>Transfer Request Permission CGPT</button> */}
       
    <button onClick={handlePrepareCalls}>Prepare Calls</button>
          <div style={{ 
            marginBottom: '10px',
            marginLeft: '50px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <select 
              value={networkIndex}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNetworkIndex(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                width: '150px'
              }}
            >

[]
              <option value="">Select Network</option>
              <option value="0">Ethereum</option>
              <option value="1">Arbitrum</option>
              <option value="2">Sepolia</option>
              <option value="3">BSC</option>
              <option value="4">BSC Testnet</option>
              <option value="5">Base</option>
              <option value="6">Base Sepolia</option>
              <option value="7">Sonic</option>
              <option value="8">Sonic Testnet</option>
              <option value="9">Polygon</option>
              <option value="10">Avalanche</option>
              <option value="11">ZKsync</option>
              <option value="12">CoreDao</option>
              <option value="13">xLayer</option>
              <option value="14">Linea</option>
              <option value="15">Blast</option>
              <option value="16">Berachain</option>
              <option value="17">Polygon Amoy</option>
              <option value="18">Solana</option>
              <option value="19">Optimism</option>
            </select>
            <button 
              onClick={() => switchNetwork(networks[Number(networkIndex)])}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Switch
            </button>
          </div>
       
        </div>
      ) : null}
    </div>
  )
}
