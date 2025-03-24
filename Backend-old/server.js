const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const USEROP_BUILDER_SERVICE_BASE_URL = "https://rpc.walletconnect.org/v1/wallet";
const PROJECT_ID = process.env.PROJECT_ID || "1e8fbe566ab223dac6fd8f4e0fdbf82c";

// Standard ERC20 ABI for transfer method
const ERC20_ABI = [
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function encodeTokenTransfer(provider, params) {
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
      data: encodedData,
      value: "0x0"
    };
  } catch (error) {
    console.error("Error encoding token transfer:", error);
    throw error;
  }
}

async function jsonRpcRequest(method, params, url) {
  try {
    const response = await axios.post(url, {
      jsonrpc: "2.0",
      id: "1",
      method,
      params
    });

    if (response.data.error) {
      throw new Error(JSON.stringify(response.data.error));
    }

    return response.data.result;
  } catch (error) {
    console.error("RPC Request Error:", error);
    throw error;
  }
}

// API endpoint to prepare calls
app.post('/api/prepare-calls', async (req, res) => {
  try {
    const { 
      from,
      chainId,
      tokenAddress,
      recipientAddress,
      amount,
      permissionsContext
    } = req.body;

    // Create provider for the specific chain
    const provider = new ethers.JsonRpcProvider(process.env[`RPC_URL_${chainId}`]);

    // Encode the token transfer
    const encodedTransfer = await encodeTokenTransfer(provider, {
      tokenAddress,
      recipientAddress,
      amount,
      fromAddress: from
    });

    // Prepare the calls arguments
    const prepareCallsArgs = {
      from,
      chainId,
      calls: [{
        to: encodedTransfer.to,
        data: encodedTransfer.data,
        value: encodedTransfer.value
      }],
      capabilities: {
        permissions: {
          context: permissionsContext,
          methods: ["eth_sendTransaction"]
        }
      }
    };

    // Make the RPC call to prepare calls
    const url = `${USEROP_BUILDER_SERVICE_BASE_URL}?projectId=${PROJECT_ID}`;
    const result = await jsonRpcRequest(
      "wallet_prepareCalls",
      [prepareCallsArgs],
      url
    );

    res.json(result);
  } catch (error) {
    console.error("Error preparing calls:", error);
    res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
});

// API endpoint to get token decimals
app.get('/api/token-decimals/:chainId/:tokenAddress', async (req, res) => {
  try {
    const { chainId, tokenAddress } = req.params;
    const provider = new ethers.JsonRpcProvider(process.env[`RPC_URL_${chainId}`]);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    res.json({ decimals });
  } catch (error) {
    console.error("Error getting token decimals:", error);
    res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 