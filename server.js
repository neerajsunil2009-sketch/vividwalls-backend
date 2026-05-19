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
        let extension = 'jpg'; // Default to jpg for standard images
        
        // Check if the URL string itself mentions mp4, or if the API headers say it's a video
        const contentType = response.headers['content-type'] || '';
        if (imageUrl.includes('.mp4') || contentType.includes('video/mp4')) {
            extension = 'mp4';
        } else if (imageUrl.includes('.webp') || contentType.includes('image/webp')) {
            extension = 'webp';
        }

        // 3. Set the download headers with the correct extension type
        res.setHeader('Content-Disposition', `attachment; filename="Vivid_Walls_Download.${extension}"`);
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