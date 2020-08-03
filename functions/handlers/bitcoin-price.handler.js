const {
  singleEndpointCall,
  multiEndpointCall,
} = require("../util/network_util");
const functions = require("firebase-functions");
const { admin, db } = require("../util/admin");

/**
 * Fetches the current price of Bitcoin.
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getBitcoinPrice = async (req, res) => {
  const currency = req.body.currency;
  const cryptocompareKey = functions.config().cryptocompare.key;

  const price = await this.currentPriceLookup(currency, cryptocompareKey);
  return res.json(price);
};

/**
 * Looks for the price of bitcoin at the timestamp specified for in the [req] body.
 * If price document not already found in database, it'll perforrm a lookup, store
 * the data in firestore and then serve it back.
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getHistorialPrice = async (req, res) => {
  const timestamp = req.body.timestamp;
  const cryptocompareKey = functions.config().cryptocompare.key;

  const data = await this.historicPriceFetch(timestamp, cryptocompareKey);
  return res.json(data);
};

// Handler logic below

// This is the main function that'll be used in the output endpoints
exports.currentPriceLookup = async (currency, apiKey) => {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${currency}&api_key=${apiKey}`;
  const data = await singleEndpointCall(url).catch((err) => console.error(err));
  return data[currency];
};

// This is the main function that'll be used in the transaction endpoints
exports.historicPriceFetch = async (timestamp, apiKey) => {
  const documentSnapshot = await db.doc(`/pricequote/${timestamp}`).get();

  if (documentSnapshot.exists) {
    console.log(
      `Price document with reference timestamp ${timestamp} requested and found in firestore. Serving document...`
    );
    return documentSnapshot.data();
  } else {
    console.log(
      `Price document with reference timestamp ${timestamp} requested and not found in firestore. Fetching pricing data from cryptocompare...`
    );
    return await this.historicPriceLookup(timestamp, apiKey);
  }
};

exports.historicPriceLookup = async (timestamp, apiKey) => {
  const currencyArray = [
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "EUR",
    "GBP",
    "HKD",
    "INR",
    "JPY",
    "KRW",
    "PHP",
    "SGD",
    "TRY",
    "USD",
    "XAU",
  ];
  let endpointArray = [];
  let currencyDocument = {};
  currencyDocument.timestamp = timestamp;

  currencyArray.forEach((currency) => {
    endpointArray.push(
      `https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=${currency}&limit=1&toTs=${timestamp}&api_key=${apiKey}`
    );
  });

  const responseArray = await multiEndpointCall(endpointArray).catch((err) =>
    console.error(err)
  );
  responseArray.forEach((priceResponse, index) => {
    currencyDocument[currencyArray[index]] = priceResponse.Data.Data[1].close;
  });

  await db
    .doc(`/pricequote/${timestamp}`)
    .set(currencyDocument)
    .catch((err) => console.error(err));

  return currencyDocument;
};
