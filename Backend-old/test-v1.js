const axios = require('axios');
const crypto = require('crypto');

class WalletServicesIntegration {
  constructor() {
    this.walletServicesBaseUrl = 'https://rpc.walletconnect.org/v1/wallets';
  }

  /**
   * Prepare calls according to EIP-5792 wallet_prepareCalls specification
   * @param {Array} prepareCallsParams Prepare calls parameters
   * @returns {Promise} Prepared calls response
   */
  async walletPrepareCalls(prepareCallsParams) {
    try {
      // Validate input structure
      this.validatePrepareCallsParams(prepareCallsParams);

      const response = await axios.post(
        `${this.walletServicesBaseUrl}/prepareCalls`, 
        {
          method: 'wallet_prepareCalls',
          params: prepareCallsParams
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in wallet_prepareCalls:', error);
      throw error;
    }
  }

  /**
   * Validate prepare calls parameters
   * @param {Array} params Prepare calls parameters
   */
  validatePrepareCallsParams(params) {
    if (!Array.isArray(params) || params.length === 0) {
      throw new Error('Prepare calls params must be a non-empty array');
    }

    const call = params[0];
    
    // Validate required fields
    if (!call.from) throw new Error('Missing "from" address');
    if (!call.chainId) throw new Error('Missing "chainId"');
    if (!call.calls || !Array.isArray(call.calls)) throw new Error('Invalid calls array');

    // Validate each call
    call.calls.forEach(callItem => {
      if (!callItem.to) throw new Error('Missing "to" address in call');
      if (!callItem.data) throw new Error('Missing "data" in call');
    });
  }

  /**
   * Encode token transfer data
   * @param {string} recipientAddress Recipient address
   * @param {number} amount Transfer amount
   * @returns {string} Encoded transfer data
   */
  encodeUSDTTransfer(recipientAddress, amount) {
    // ERC-20 transfer method signature
    const methodSignature = '0xa9059cbb';

    // Pad recipient address (remove '0x' if present)
    const paddedRecipientAddress = this.padAddress(recipientAddress);

    // Convert amount to smallest unit (6 decimals for USDT)
    const paddedAmount = this.padAmount(amount * 1000000);

    // Concatenate method signature, recipient address, and amount
    return methodSignature + paddedRecipientAddress + paddedAmount;
  }

  /**
   * Pad Ethereum address to 32 bytes
   * @param {string} address Ethereum address
   * @returns {string} Padded address
   */
  padAddress(address) {
    // Remove '0x' if present and pad to 32 bytes
    const cleanAddress = address.replace(/^0x/, '');
    return cleanAddress.padStart(64, '0');
  }

  /**
   * Pad amount to 32 bytes
   * @param {number} amount Amount to pad
   * @returns {string} Padded amount
   */
  padAmount(amount) {
    // Convert to hex and pad to 32 bytes
    return amount.toString(16).padStart(64, '0');
  }

  /**
   * Prepare calls with comprehensive ERC-7715 permissions context
   * @param {Object} params Preparation parameters
   * @returns {Promise} Prepared calls response
   */
  async prepareCallsWithPermissions(params) {
    const { 
      from, 
      chainId, 
      contractAddress, 
      recipientAddress, 
      amount 
    } = params;

    // Encode transfer data
    const encodedData = this.encodeUSDTTransfer(recipientAddress, amount);

    // Construct prepare calls payload
    const prepareCallsParams = [{
      from: from,
      chainId: chainId,
      calls: [{
        to: contractAddress,
        data: encodedData,
        value: '0x0'
      }],
      capabilities: {
        permissions: {
          context: JSON.stringify({
            permissions: [{
              type: 'session_key',
              data: {
                address: contractAddress,
                abi: [
                  {
                    constant: false,
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'recipient',
                        type: 'address'
                      },
                      {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256'
                      }
                    ],
                    name: 'transfer',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                      }
                    ],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'function'
                  }
                ],
                functions: [
                  {
                    functionName: 'transfer'
                  }
                ]
              }
            }],
            context: crypto.randomBytes(16).toString('hex'),
            expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
            address: from,
            chainId: chainId
          })
        }
      }
    }];

    // Execute prepare calls
    return this.walletPrepareCalls(prepareCallsParams);
  }
}

// Example usage
async function exampleUsage() {
  const walletServices = new WalletServicesIntegration();

  try {
    const preparedCalls = await walletServices.prepareCallsWithPermissions({
      from: '0xF06fd9f072A1AaB35497c3c2820094FD9AbA23EF', // Sender address
      chainId: '0xaa36a7', // Sepolia testnet
      contractAddress: '0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D', // USDT contract
      recipientAddress: '0x0c3f6E88ad57473Ca2Ae8A8c5CaFd6B270F98999', // Recipient address
      amount: 10 // 10 USDT
    });

    console.log('Prepared Calls:', preparedCalls);
  } catch (error) {
    console.error('Prepare calls failed:', error);
  }
}

// Run the example
exampleUsage();

// module.exports = WalletServicesIntegration;