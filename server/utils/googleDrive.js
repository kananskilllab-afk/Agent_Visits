const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Path to your Service Account JSON key
const KEYFILEPATH = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH || path.join(__dirname, '../google_drive_credentials.json');

// Scopes required for Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let driveClient = null;

const getDriveClient = () => {
  if (driveClient) return driveClient;
  
  if (!fs.existsSync(KEYFILEPATH)) {
    console.warn('Google Drive Credentials JSON not found at:', KEYFILEPATH);
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
};

module.exports = { getDriveClient };
