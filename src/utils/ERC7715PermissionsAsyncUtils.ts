import { signMessage } from "viem/accounts";
import { toHex, type Chain } from "viem";
import {
  Call,
  prepareCalls,
  sendPreparedCalls,
} from "./UserOpBuilderServiceUtils";

export type MultikeySigner = {
  type: "keys";
  data: {
    ids: string[];
  };
};

export async function executeActionsWithECDSAKey(): Promise<string> {
  // const {
  //   ecdsaPrivateKey,
  //   actions,
  //   chain,
  //   accountAddress,
  //   permissionsContext,
  // } = args;
  // if (!permissionsContext) {
  //   throw new Error("No permissions available");
  // }
  // if (!accountAddress) {
  //   throw new Error("No account Address available");
  // }
console.log("Prepare Calls is Calling")
  const prepareCallsResponse = await prepareCalls({
    "from":"0xb14Eb2DbF60EAf77B85cbbFB3bC038e6973970C8", 
    chainId:"0xaa36a7",
    calls: [{
      "to": "0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99", // Contract address
      "data": "0xa9059cbb0000000000000000000000000c3f6e88ad57473ca2ae8a8c5cafd6b270f989990000000000000000000000000000000000000000000000000000000000989680",   // Encoded contract method call
      "value": "0x0"     // Optional ETH value
    }],
    capabilities: {
      permissions: {
        context:  "52fc5665-af94-4ecb-a0a8-122cb632a34d",// EIP-7715 permissions context
    }
    },
  });

  console.log("Prepare Calls Response: ", prepareCallsResponse)
  if (prepareCallsResponse.length !== 1 && prepareCallsResponse[0]) {
    throw new Error("Invalid response type");
  }
  const response = prepareCallsResponse[0];
  if (!response || response.preparedCalls.type !== "user-operation-v07") {
    throw new Error("Invalid response type");
  }
  // const signatureRequest = response.signatureRequest;
  // const dappSignature = await signMessage({
  //   privateKey: ecdsaPrivateKey,
  //   message: { raw: signatureRequest.hash },
  // });

  // const sendPreparedCallsResponse = await sendPreparedCalls({
  //   context: response.context,
  //   preparedCalls: response.preparedCalls,
  //   signature: dappSignature,
  // });

  // const userOpIdentifier = sendPreparedCallsResponse[0];

  // return userOpIdentifier;
}
