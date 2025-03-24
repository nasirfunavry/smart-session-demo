const { WalletConnect } = require("@walletconnect/client");
// const Web3 = require("web3");

async function prepareWalletCalls() {
    const connector = new WalletConnect({
        bridge: "https://rpc.walletconnect.org/v1/wallets/prepareCalls" // WalletConnect bridge
    });

    if (!connector.connected) {
        await connector.createSession();
    }

    const requestBody = {
        from: "0xb14Eb2DbF60EAf77B85cbbFB3bC038e6973970C8", // Replace with sender address
        chainId: "0xaa36a7", // Replace with actual chain ID
        calls: [{
            to: '0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99', // Contract address
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
        const response = await connector.sendCustomRequest({
            method: "wallet_prepareCalls",
            params: [requestBody]
        });

        console.log("Response:", response);
        return response;
    } catch (error) {
        console.error("Error preparing wallet calls:", error);
    }
}

// Call the function
prepareWalletCalls();
