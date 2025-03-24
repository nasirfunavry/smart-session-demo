async function prepareWalletCalls() {
    const url = `https://rpc.walletconnect.org/v1/wallet?projectId=1e8fbe566ab223dac6fd8f4e0fdbf82c`;
    
    const requestBody = {
        from: "0xF06fd9f072A1AaB35497c3c2820094FD9AbA23EF", // Replace with sender address
        chainId: "0xaa36a7", // Replace with actual chain ID
        calls: [{
            to: '0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D', // Contract address
            data: '0xa9059cbb0000000000000000000000000c3f6e88ad57473ca2ae8a8c5cafd6b270f989990000000000000000000000000000000000000000000000000000000000989680',   // Encoded contract method call
            value: '0x0'     // Optional ETH value
        }],
        capabilities: {
            permissions: {
                context: "921c8b1e-a42a-4d5a-8a3c-6d313d74c969" // EIP-7715 permissions context
            }
        }
    };
    
    try {
        console.log("Sending call To Prepare Transacton")
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    jsonrpc: "2.0",
                    id: "1",
                    method:"wallet_prepareCalls",
                    params:[requestBody]
                }
            )
        });



        // const response = await fetch(url, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(
        //       {
        //         jsonrpc: "2.0",
        //         id: "1",
        //         method,
        //         params,
        //       },
        //       bigIntReplacer,
        //     ),
        //   });



        console.log("Response : ", response)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`, await response.text());
        }
        
        const data = await response.json();
        console.log("Response:", data);
        return data;
    } catch (error) {
        console.error("Error preparing wallet calls:", error);
    }
}

 function bigIntReplacer(value) {
    if (typeof value === "bigint") {
      return `0x${value.toString(16)}`;
    }
  
    return value;
  }
// Call the function
prepareWalletCalls();
