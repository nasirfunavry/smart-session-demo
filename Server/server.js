const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/prepare-calls', async (req, res) => {
  try {
    console.log("Preparing calls")
    const response = await axios({
      method: 'POST',
      url: 'https://rpc.walletconnect.org/v1/wallets/prepareCalls',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer d55125ca-e815-4dd2-8700-92ae97ba381b'
      },
      data: {
        from: "0xb14Eb2DbF60EAf77B85cbbFB3bC038e6973970C8",
        chainId: "0xaa36a7",
        calls: {
          to: "0x8Ef14ACf20223fcC4489e1cd3f064a1300Beac99",
          data: "0xa9059cbb0000000000000000000000000c3f6e88ad57473ca2ae8a8c5cafd6b270f989990000000000000000000000000000000000000000000000000000000000989680",
          value: "0x0"
        },
        capabilities: {
          permissions: {
            context: "921c8b1e-a42a-4d5a-8a3c-6d313d74c969"
          }
        }
      }
    });

    res.json(response.data);
  } catch (error) {
    console.log("Error:", error)
    console.error('Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error'
    });
  }
});

// check helth
app.get('/health', (req, res) => {
  console.log("Health check")
  res.status(200).json({
    status: 'ok'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});