const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


const SHEET_ID = "1__AKMdWJAHEDTmb_KPnEcd7sOMsOx416-x5NLKqCXa0"; 
const GOOGLE_API_CREDENTIALS = require("./credentials.json"); 

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_API_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

app.post("/submit", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
