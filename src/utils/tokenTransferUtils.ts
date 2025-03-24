import { ethers } from 'ethers';
import { type Address } from 'viem';

// Standard ERC20 ABI for transfer method
const ERC20_ABI = [
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export interface TokenTransferParams {
  tokenAddress: Address;
  recipientAddress: Address;
  amount: string | number;
  fromAddress: Address;
}

export async function encodeTokenTransfer(
  provider: ethers.Provider,
  params: TokenTransferParams
): Promise<{
  to: Address;
  data: `0x${string}`;
  value: `0x${string}`;
}> {
  try {
    // Create contract instance
    const tokenContract = new ethers.Contract(
      params.tokenAddress,
      ERC20_ABI,
      provider
    );

    // Get token decimals
    const decimals = await tokenContract.decimals();
    
    // Convert amount to smallest unit (wei)
    const amountInSmallestUnit = ethers.parseUnits(
      params.amount.toString(),
      decimals
    );

    // Encode the transfer method call
    const encodedData = tokenContract.interface.encodeFunctionData("transfer", [
      params.recipientAddress,
      amountInSmallestUnit
    ]);

    return {
      to: params.tokenAddress,
      data: encodedData as `0x${string}`,
      value: "0x0" as `0x${string}`
    };
  } catch (error) {
    console.error("Error encoding token transfer:", error);
    throw error;
  }
}

export function decodeTokenTransfer(
  encodedData: `0x${string}`,
  decimals: number
): { recipient: Address; amount: string } | null {
  try {
    const iface = new ethers.Interface(ERC20_ABI);
    const decodedCall = iface.decodeFunctionData("transfer", encodedData);
    
    return {
      recipient: decodedCall[0] as Address,
      amount: ethers.formatUnits(decodedCall[1], decimals)
    };
  } catch (error) {
    console.error('Decoding failed:', error);
    return null;
  }
}

// Example usage:
/*
const provider = new ethers.BrowserProvider(window.ethereum);
const transferParams = {
  tokenAddress: "0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99", // USDT contract
  recipientAddress: "0x0C3F6e88aD57473Ca2ae8a8C5CAFD6b270F98999",
  amount: "10", // 10 USDT
  fromAddress: "0xb14Eb2DbF60EAf77B85cbbFB3bC038e6973970C8"
};

const encodedTransfer = await encodeTokenTransfer(provider, transferParams);
*/ 