const express = require("express");
const cors = require("cors");
require('dotenv').config();
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


const SHEET_ID = "1__AKMdWJAHEDTmb_KPnEcd7sOMsOx416-x5NLKqCXa0"; 
const GOOGLE_API_CREDENTIALS = require("./credentials.json"); 

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

app.post("/api/submit", async (req, res) => {
  try {
    const { name, orders } = req.body;

    if (!name || !orders) {
      return res.status(400).send("Nama dan pesanan harus diisi.");
    }

    const values = [
      [name, orders.map(order => `${order.name} (${order.quantity})`).join(", ")]
    ];
    

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:B",
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    });

    res.status(200).send("Data berhasil dikirim ke Google Sheets!");
  } catch (error) {
    console.error("Error saat mengirim data ke Google Sheets:", error);
    res.status(500).send("Terjadi kesalahan saat mengirim data.");
  }
});

module.exports = app;