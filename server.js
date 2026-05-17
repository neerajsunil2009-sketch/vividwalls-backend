const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// This tells the server where your local images are stored
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/download', async (req, res) => {
    let fileUrl = req.query.url;
    const fileName = req.query.name || 'VividWall.jpg';

    console.log(`📥 Request received for: ${fileUrl}`);

    // CHECK: Is it a local file or a website link?
    if (fileUrl.startsWith('images/') || !fileUrl.startsWith('http')) {
        // --- LOCAL FILE LOGIC ---
        const localPath = path.join(__dirname, fileUrl);
        console.log(`🏠 Serving local file from: ${localPath}`);
        
        return res.download(localPath, fileName, (err) => {
            if (err) {
                console.error("❌ Local file error:", err.message);
                res.status(404).send('Local image not found on server.');
            }
        });
    } else {
        // --- EXTERNAL LINK LOGIC (Unsplash/Pexels) ---
        try {
            const response = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream'
            });
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            response.data.pipe(res);
            console.log(`✅ External download starting: ${fileName}`);
        } catch (e) {
            console.error("❌ External fetch error:", e.message);
            res.status(500).send('Server could not fetch the external image.');
        }
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));