const { ethers } = require('ethers');

// Function to encode USDT transfer data
function encodeUSDTTransfer(recipientAddress, amount) {
  // USDT ABI for transfer method
  const usdtAbi = [
    "function transfer(address recipient, uint256 amount)"
  ];

  // Create an interface using the ABI
  const iface = new ethers.Interface(usdtAbi);

  // Encode the transfer call
  // For USDT, we use 6 decimal places
  const amountInSmallestUnit = ethers.parseUnits(amount.toString(), 6);

  // Encode the transfer method call
  const encodedData = iface.encodeFunctionData("transfer", [
    recipientAddress, 
    amountInSmallestUnit
  ]);

  return encodedData;
}

// Example usage
function exampleUSDTTransfer() {
  // USDT Contract Address on Ethereum Mainnet
  const usdtContractAddress = '0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99';

  // Recipient address
  const recipientAddress = '0x0C3F6e88aD57473Ca2ae8a8C5CAFD6b270F98999';

  // Amount to transfer
  const amount = 10; // 10 USDT

  // Encode transfer data
  const encodedTransferData = encodeUSDTTransfer(recipientAddress, amount);

  // Construct the full call object
  const transferCall = {
    from: '0xb14Eb2DbF60EAf77B85cbbFB3bC038e6973970C8', // Replace with sender's address
    to: usdtContractAddress,
    data: encodedTransferData,
    value: '0x0' // No ETH value for token transfer
  };

  console.log('Encoded USDT Transfer Data:', encodedTransferData);
  console.log('Full Transfer Call:', transferCall);

  return transferCall;
}

// Demonstration of decoding (optional, for verification)
function decodeUSDTTransfer(encodedData) {
  const usdtAbi = [
    "function transfer(address recipient, uint256 amount)"
  ];

  const iface = new ethers.Interface(usdtAbi);

  try {
    // Decode the function call data
    const decodedCall = iface.decodeFunctionData("transfer", encodedData);
    
    return {
      recipient: decodedCall[0],
      amount: ethers.formatUnits(decodedCall[1], 6)
    };
  } catch (error) {
    console.error('Decoding failed:', error);
    return null;
  }
}

// Run the example
const transferCall = exampleUSDTTransfer();

// Optional decode verification
const decodedTransfer = decodeUSDTTransfer(transferCall.data);
if (decodedTransfer) {
  console.log('Decoded Transfer:', decodedTransfer);
}

// // For use in module exports
// module.exports = {
//   encodeUSDTTransfer,
//   exampleUSDTTransfer,
//   decodeUSDTTransfer
// };