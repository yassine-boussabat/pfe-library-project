const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class ThumbnailService {
  async downloadAndSaveGoogleThumbnail(thumbnailUrl, fileId) {
    try {
      if (!thumbnailUrl) return null;
      
      const thumbnailDir = path.join(process.cwd(), '..', 'frontend', 'public', 'thumbnails');
      
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      const localPath = path.join(thumbnailDir, `${fileId}.png`);
      
      // Check if already downloaded
      if (fs.existsSync(localPath)) {
        return `/thumbnails/${fileId}.png`;
      }

      // Download the image
      await this.downloadImage(thumbnailUrl, localPath);
      
      if (fs.existsSync(localPath)) {
        return `/thumbnails/${fileId}.png`;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Thumbnail download error:`, error.message);
      return null;
    }
  }

  downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const request = client.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filepath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
          file.on('error', (err) => {
            fs.unlink(filepath, () => {}); // Clean up on error
            reject(err);
          });
        } else {
          reject(new Error(`Failed to download: ${response.statusCode}`));
        }
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      // 10 second timeout
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }
}

module.exports = new ThumbnailService();
