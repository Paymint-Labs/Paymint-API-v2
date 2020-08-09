const functions = require("firebase-functions");
const app = require("express")(); // Import and initialize express

const { getFeeDensity } = require("./handlers/fees.handler");
const { pushTransaction } = require("./handlers/push-tx.handler");
const { getTxCountForAddress } = require("./handlers/tx-count.handler");
const { getAddressForIndexTx } = require("./handlers/voutlookup.handler");
const { getOutputDataForWallet } = require("./handlers/output-data.handler");
const { getTransactionDataForWallet } = require("./handlers/tx-data.handler");
const { getMarketInfo } = require("./handlers/market-info.handler");
const {
  getBitcoinPrice,
  getHistorialPrice,
} = require("./handlers/bitcoin-price.handler");

// Main Routes
app.post("/outputData", getOutputDataForWallet);
app.post("/txData", getTransactionDataForWallet);
app.post("/voutLookup", getAddressForIndexTx);
app.post("/pushtx", pushTransaction);

// Miscellaneous Routes
app.post("/currentBitcoinPrice", getBitcoinPrice);
app.post("/historicalBitcoinPrice", getHistorialPrice);
app.post("/fees", getFeeDensity);
app.post("/txCount", getTxCountForAddress);
app.post("/getMarketInfo", getMarketInfo);

exports.api = functions.https.onRequest(app); // Serve the express routes via the /api endpoint on the main URI
