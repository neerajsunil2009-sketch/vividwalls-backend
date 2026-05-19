const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// This tells the server where your local images are stored
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/download', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        // Grab the custom name sent over by the frontend (default to 'wallpaper' if empty)
        const customName = req.query.name || 'wallpaper'; 

        if (!imageUrl) {
            return res.status(400).send('URL is required');
        }

        // 1. Fetch the wallpaper file from the external API
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });

        // 2. Dynamically determine the correct file extension
        let extension = 'jpg'; 
        const contentType = response.headers['content-type'] || '';
        if (imageUrl.includes('.mp4') || contentType.includes('video/mp4')) {
            extension = 'mp4';
        } else if (imageUrl.includes('.webp') || contentType.includes('image/webp')) {
            extension = 'webp';
        }

        // 3. Set the download headers using your custom name variable!
        res.setHeader('Content-Disposition', `attachment; filename="Vivid_Walls_${customName}.${extension}"`);
        res.setHeader('Content-Type', contentType || (extension === 'mp4' ? 'video/mp4' : 'image/jpeg'));

        // 4. Pipe the file stream directly to the user's browser
        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Error downloading file');
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));