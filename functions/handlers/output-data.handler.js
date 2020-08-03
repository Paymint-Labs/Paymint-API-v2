const { multiEndpointCall } = require("../util/network_util");
const { currentPriceLookup } = require("./bitcoin-price.handler");
const { convertToDisplayPrice } = require("../util/misc");

const functions = require("firebase-functions");

/**
 * Returns schema for output data
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getOutputDataForWallet = async (req, res) => {
  const allAddresses = req.body.allAddresses;
  const currency = req.body.currency;
  const url = req.body.url;

  return res.json(
    await retrieveOutputAndBalanceDataForWallet(allAddresses, currency, url)
  );
};

// Handler logic below

retrieveOutputAndBalanceDataForWallet = async (
  allAddresses,
  currency,
  EsploraUrl
) => {
  const cryptocompareKey = functions.config().cryptocompare.key;

  let endpointArray = [];
  let outputArray = [];
  let satoshiBalance = 0;
  let currentPrice = await currentPriceLookup(currency, cryptocompareKey);

  allAddresses.forEach((address) => {
    endpointArray.push(`${EsploraUrl}/address/${address}/utxo`);
  });

  // Extracting every output from [allAddresses] and adding to outputArray and satoshiBalance
  await multiEndpointCall(endpointArray).then((responseArray) => {
    for (let i = 0; i < responseArray.length; i++) {
      const outputDataArray = responseArray[i];
      for (let j = 0; j < outputDataArray.length; j++) {
        const output = outputDataArray[j];

        outputArray.push(output);
        if (output.status.confirmed === true)
          satoshiBalance += parseInt(output.value);
      }
    }
  });

  let currencyBalanceRaw = currentPrice * (satoshiBalance / 100000000);

  for (let i = 0; i < outputArray.length; i++) {
    const outputSatoshiValue = outputArray[i].value;
    const outputBtcValue = outputSatoshiValue / 100000000;
    const outputBtcPrice = currentPrice * outputBtcValue;
    outputArray[i].rawWorth = outputBtcPrice;
    outputArray[i].fiatWorth = convertToDisplayPrice(outputBtcPrice, currency);
  }

  outputArray.sort((a, b) => {
    return (b.value = a.value);
  });

  return {
    total_user_currency: convertToDisplayPrice(currencyBalanceRaw, currency),
    total_sats: satoshiBalance,
    total_btc: satoshiBalance / 100000000,
    outputArray: outputArray,
  };
};
