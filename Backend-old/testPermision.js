const axios = require('axios');

class WalletServicesIntegration {
  constructor() {
    this.walletServicesBaseUrl = 'https://rpc.walletconnect.org/v1/wallets';
  }

  /**
   * Prepare calls with wallet permissions
   * @param {Object} request Prepare calls request with EIP-5792 and ERC-7715 context
   * @returns {Promise} Prepared calls and signature request
   */
  async prepareCalls(request) {
    try {
      const response = await axios.post(
        `${this.walletServicesBaseUrl}/prepareCalls`, 
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error preparing calls:', error);
      throw error;
    }
  }

  /**
   * Send prepared calls with signature
   * @param {Object} preparedCallsResponse Prepared calls response from prepareCalls
   * @param {string} signature User's signature
   * @returns {Promise<string>} Calls ID from the wallet
   */
  async sendPreparedCalls(preparedCallsResponse, signature) {
    const sendRequest = {
      prepared: preparedCallsResponse.prepared,
      signature: signature,
      context: preparedCallsResponse.prepared.context
    };

    try {
      const response = await axios.post(
        `${this.walletServicesBaseUrl}/sendPreparedCalls`, 
        sendRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data.callsId; // EIP-5792 calls ID
    } catch (error) {
      console.error('Error sending prepared calls:', error);
      throw error;
    }
  }

  /**
   * Complete workflow for sending calls with permissions
   * @param {string} chainId Blockchain chain ID
   * @param {Array} calls Array of calls to execute
   * @param {string} [permissionsContext] Optional ERC-7715 permissions context
   * @returns {Promise<string>} Calls ID
   */
  async executeCallsWithPermissions(chainId, calls, permissionsContext) {
    const prepareRequest = {
      chainId: chainId,
      calls: calls,
      capabilities: permissionsContext 
        ? { permissions: { context: permissionsContext } } 
        : undefined
    };

    // Step 1: Prepare Calls
    const preparedCallsResponse = await this.prepareCalls(prepareRequest);

    // Step 2: Get User Signature (This part depends on your wallet integration)
    const signature = await this.getUserSignature(preparedCallsResponse);

    // Step 3: Send Prepared Calls
    const callsId = await this.sendPreparedCalls(preparedCallsResponse, signature);

    return callsId;
  }

  /**
   * Placeholder for signature method - implement based on your wallet
   * @param {Object} preparedCallsResponse Prepared calls response
   * @returns {Promise<string>} Signature
   */
  async getUserSignature(preparedCallsResponse) {
    // Implement signature logic:
    // 1. Use wallet connection (e.g., WalletConnect, Web3Modal)
    // 2. Request user to sign prepared calls
    // 3. Return signature
    throw new Error('Signature method must be implemented');
  }
}

// Example usage
async function exampleUsage() {
  const walletServices = new WalletServicesIntegration();

  const calls = [{
    from: '0xF06fd9f072A1AaB35497c3c2820094FD9AbA23EF', // User's address
    to: '0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D', // Contract address
    data: '0xa9059cbb0000000000000000000000000c3f6e88ad57473ca2ae8a8c5cafd6b270f989990000000000000000000000000000000000000000000000000000000000989680',   // Encoded contract method call
    value: '0x0'     // Optional ETH value
  }];

  // Optional ERC-7715 permissions context
  const permissionsContext = JSON.stringify({
    permissions: [
      {
        type: 'session_key',
        data: {
            "address": "0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D",
            "abi": [
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
            "functions": [
                {
                    "functionName": "transfer"
                }
            ]
        }
      }
    ],
    "context": "921c8b1e-a42a-4d5a-8a3c-6d313d74c969",
    "expiry": 1741151271184,
    "address": "0xF06fd9f072A1AaB35497c3c2820094FD9AbA23EF",
    "chainId": "0xaa36a7"
  });

  try {
    const callsId = await walletServices.executeCallsWithPermissions(
      '0xaa36a7', // Ethereum Spolia
      calls,
      permissionsContext
    );

    console.log('Calls executed with ID:', callsId);
  } catch (error) {
    console.error('Call execution failed:', error);
  }
}

exampleUsage()
// Export the class for use in other modules
// module.exports = WalletServicesIntegration;