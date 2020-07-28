const functions = require('firebase-functions');
const app = require('express')();  // Import and initialize express

exports.api = functions.https.onRequest(app);  // Serve the express routes via the /api endpoint on the main URI