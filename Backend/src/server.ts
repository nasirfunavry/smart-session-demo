import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Constants
const USEROP_BUILDER_SERVICE_BASE_URL = "https://rpc.walletconnect.org/v1/wallet";
const PROJECT_ID = process.env.PROJECT_ID || "1e8fbe566ab223dac6fd8f4e0fdbf82c";

// Types
interface TokenTransferParams {
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  fromAddress: string;
}

interface PrepareCallsRequest {
  from: string;
  chainId: string;
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  permissionsContext: string;
}

interface SendPreparedCallsRequest {
  preparedCalls: any;
  chainId: string;
  from: string;
  permissionsContext: string;
}

// Standard ERC20 ABI for transfer method
const ERC20_ABI = [
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Utility functions
async function encodeTokenTransfer(provider: ethers.JsonRpcProvider, params: TokenTransferParams) {
  try {
    const tokenContract = new ethers.Contract(
      params.tokenAddress,
      ERC20_ABI,
      provider
    );

    const decimals = await tokenContract.decimals();
    const amountInSmallestUnit = ethers.parseUnits(
      params.amount,
      decimals
    );

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

async function jsonRpcRequest(method: string, params: any[], url: string) {
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

// API endpoints
app.post('/api/prepare-calls', async (req: Request<{}, {}, PrepareCallsRequest>, res: Response, next: NextFunction) => {
  try {
    const { 
      from,
      chainId,
      tokenAddress,
      recipientAddress,
      amount,
      permissionsContext
    } = req.body;

    const provider = new ethers.JsonRpcProvider(process.env[`RPC_URL_${chainId}`]);

    const encodedTransfer = await encodeTokenTransfer(provider, {
      tokenAddress,
      recipientAddress,
      amount,
      fromAddress: from
    });

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

    const url = `${USEROP_BUILDER_SERVICE_BASE_URL}?projectId=${PROJECT_ID}`;
    const result = await jsonRpcRequest(
      "wallet_prepareCalls",
      [prepareCallsArgs],
      url
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/token-decimals/:chainId/:tokenAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId, tokenAddress } = req.params;
    const provider = new ethers.JsonRpcProvider(process.env[`RPC_URL_${chainId}`]);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    res.json({ decimals });
  } catch (error) {
    next(error);
  }
});

app.post('/api/send-prepared-calls', async (req: Request<{}, {}, SendPreparedCallsRequest>, res: Response, next: NextFunction) => {
  try {
    const { 
      preparedCalls,
      chainId,
      from,
      permissionsContext
    } = req.body;

    const url = `${USEROP_BUILDER_SERVICE_BASE_URL}?projectId=${PROJECT_ID}`;
    
    // First, prepare the calls
    const prepareResult = await jsonRpcRequest(
      "wallet_prepareCalls",
      [{
        from,
        chainId,
        calls: preparedCalls.calls,
        capabilities: {
          permissions: {
            context: permissionsContext,
            methods: ["eth_sendTransaction"]
          }
        }
      }],
      url
    );

    // Then, send the prepared calls
    const sendResult = await jsonRpcRequest(
      "wallet_sendPreparedCalls",
      [{
        preparedCalls: prepareResult,
        chainId,
        from,
        capabilities: {
          permissions: {
            context: permissionsContext,
            methods: ["eth_sendTransaction"]
          }
        }
      }],
      url
    );

    res.json(sendResult);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || "Internal server error"
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 