const functions = require("firebase-functions");
const app = require("express")(); // Import and initialize express

const { getOutputDataForWallet } = require('./handlers/output-data.handler');

// Main Routes
app.post("/outputData", getOutputDataForWallet);
app.post("/txData", getTransactionDataForWallet);
app.post("/pushtx", pushTransaction);

// Miscellaneous Routes
app.post("/bitcoinPrice", getBitcoinPrice);
app.get("/fees", getOnChainFeeDensity);
app.post("/txCount", getTransactionCountForAddress);

exports.api = functions.https.onRequest(app); // Serve the express routes via the /api endpoint on the main URI
