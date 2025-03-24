const axios = require('axios');
const sharp = require('sharp');

async function prepareBscScanLogo(imageUrl) {
    try {
        // Download the image  
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        // Resize and format image according to BSCScan requirements
        const processedImage = await sharp(imageBuffer)
            .resize(32, 32)  // BSCScan requirement: 32x32px
            .png({ quality: 100 })
            .toBuffer();
        return processedImage;
    } catch (error) {
        console.error('Error preparing logo:', error);
        throw error;
    }
}

async function submitToBscScan(tokenData) {
    try {
        // BSCScan's update endpoint
        const url = 'https://bscscan.com/tokens/updateinfo';
        
        // Prepare form data
        const formData = new FormData();
        formData.append('address', tokenData.address);
        formData.append('email', tokenData.email);
        formData.append('name', tokenData.name);
        formData.append('symbol', tokenData.symbol);
        formData.append('decimals', tokenData.decimals);
        formData.append('website', tokenData.website);
        formData.append('logo', tokenData.logo);
        formData.append('description', tokenData.description);

        // Submit to BSCScan
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error submitting to BSCScan:', error);
        throw error;
    }
}

// Main function to handle the entire process
async function updateBscScanTokenInfo(tokenData, imageUrl) {
    try {
        // Process the logo first
        const processedLogo = await prepareBscScanLogo(imageUrl);
        
        // Prepare the full token data
        const submitData = {
            ...tokenData,
            logo: processedLogo
        };

        // Submit to BSCScan
        const result = await submitToBscScan(submitData);
        
        return {
            success: true,
            message: 'Token info submitted to BSCScan',
            result
        };
    } catch (error) {
        console.error('Failed to update BSCScan token info:', error);
        throw error;
    }
}

module.exports = {
    prepareBscScanLogo,
    submitToBscScan,
    updateBscScanTokenInfo
};