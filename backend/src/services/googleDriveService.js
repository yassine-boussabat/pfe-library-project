require('dotenv').config();
const { google } = require('googleapis');

class GoogleDriveService {
  constructor() {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      this.isEnabled = false;
      return;
    }

    try {
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (!privateKey.startsWith('"')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      } else {
        privateKey = privateKey.slice(1, -1).replace(/\\n/g, '\n');
      }

      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
      
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.isEnabled = true;
    } catch (error) {
      this.isEnabled = false;
    }
  }

  async listPDFFiles() {
    if (!this.isEnabled) {
      throw new Error('Google Drive service not configured');
    }
    
    try {
      let allFiles = [];
      let pageToken = null;
      
      do {
        const params = {
          q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType='application/pdf'`,
          fields: 'files(id, name, size, modifiedTime, thumbnailLink), nextPageToken',
          pageSize: 100
        };
        
        if (pageToken) {
          params.pageToken = pageToken;
        }
        
        const response = await this.drive.files.list(params);
        
        if (response.data.files) {
          const filesWithThumbnails = response.data.files.map(file => {
            return file;
          });
          
          allFiles = allFiles.concat(filesWithThumbnails);
        }
        
        pageToken = response.data.nextPageToken;
      } while (pageToken);
      
      return allFiles;
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(fileId) {
    if (!this.isEnabled) {
      throw new Error('Google Drive service not configured');
    }
    
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, { responseType: 'stream' });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getDownloadUrl(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
}

module.exports = new GoogleDriveService();
