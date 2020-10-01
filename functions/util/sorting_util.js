// The following functions are sorting utility/helper functions to be used wherever necessary
const { extractDateFromTimestamp, convertToDisplayPrice } = require("./misc");
const { currentPriceLookup, historicPriceFetch } = require("../handlers/bitcoin-price.handler");
const functions = require("firebase-functions");

/**
 * Returns true if the transaction id, [idToCheckFor] exists in the
 * transaction array passed to the function, [txArrayToCheckFrom]
 * Returns false otherwise.
 *
 * @param {array} txArrayToCheckFrom
 * @param {string} idToCheckFor
 */
exports.duplicateTransactionCheck = (txArrayToCheckFrom, idToCheckFor) => {
  for (let i = 0; i < txArrayToCheckFrom.length; i++) {
    if (txArrayToCheckFrom[i].txid === idToCheckFor) {
      return true;
    }
  }
  return false;
};

/**
 * Expects the response from sortTransactionArray as input, [txArray]. Returns
 * the expected output of /txData
 *
 * @param {array} txArray
 */
exports.buildDatetimeChunks = (txArray) => {
  let finalDictionary = { dateTimeChunks: [] };
  let dateArray = [];

  for (let i = 0; i < txArray.length; i++) {
    const txObject = txArray[i];
    let timestampDate = extractDateFromTimestamp(txObject.timestamp);
    let txTimeArray = [txObject.timestamp, timestampDate];

    if (dateArray.includes(txTimeArray[1])) {
      finalDictionary.dateTimeChunks.forEach((chunk) => {
        if (extractDateFromTimestamp(chunk.timestamp) === txTimeArray[1]) {
          chunk["transactions"].push(txObject);
        }
      });
    } else {
      dateArray.push(txTimeArray[1]);
      let timeChunkObject = {
        timestamp: txTimeArray[0],
        transactions: [txObject],
      };
      finalDictionary.dateTimeChunks.push(timeChunkObject);
    }
  }
  return finalDictionary;
};

/**
 * Returns something - fill this in later
 *
 * @param {array} txArray
 * @param {string[]} allAddresses
 * @param {string} currency
 * @param {string[]} changeAddresses
 */
exports.sortTransactionArray = async (txArray, allAddresses, currency, changeAddresses) => {
  const cryptocompareKey = functions.config().cryptocompare.key;
  // const cryptocompareKey =
  //   "650ac229320ae8d475fce6df4650fd8a05f77e591060d2e5603ea10294489250";
  let midSortedTxArray = [];
  let currentPrice = await currentPriceLookup(currency, cryptocompareKey);

  for (let i = 0; i < txArray.length; i++) {
    const txObject = txArray[i];
    let sendersArray = [];
    let recipientsArray = [];
    let inputAmtSentFromWallet = 0; // Usually only has value when txType = 'Send'
    let outputAmtAddressedToWallet = 0; // Usually has value regardless of txType due to change addresses

    let midSortedTx = {};
    let aliens = [];

    // Populate senders array, add up total input satoshi values,
    txObject.vin.forEach((input) => {
      sendersArray.push(input.prevout.scriptpubkey_address);
    });

    // Populate recipients array, add up total output satoshi values
    txObject.vout.forEach((output) => {
      recipientsArray.push(output.scriptpubkey_address);
    });

    // Checks for user controlled addresses in each transaction's input array and marks tyType accordingly
    const foundInSenders = allAddresses.some((address) => sendersArray.includes(address));

    // If txType = Sent, then calulate inputAmtSentFromWallet, calculate who received how much in aliens array (check outputs)
    if (foundInSenders) {
      txObject.vin.forEach((input) => {
        if (allAddresses.includes(input.prevout.scriptpubkey_address)) {
          inputAmtSentFromWallet += input.prevout.value;
        }
      });
      txObject.vout.forEach((output) => {
        if (changeAddresses.includes(output.scriptpubkey_address)) {
          inputAmtSentFromWallet -= output.value;
        }
      });
      // Subtract transaction fee
      inputAmtSentFromWallet -= txObject.fee;
      // If txType = Received, then calculate output amount addressed to user controlled addresses - (allAddresses)
    } else if (!foundInSenders) {
      txObject.vout.forEach((output) => {
        if (allAddresses.includes(output.scriptpubkey_address)) {
          outputAmtAddressedToWallet += output.value;
        }
      });
    }

    // Craft sorted transaction
    midSortedTx.txid = txObject.txid;
    midSortedTx.confirmed_status = txObject.status.confirmed;
    midSortedTx.timestamp = txObject.status.block_time;
    if (foundInSenders) {
      midSortedTx.txType = "Sent";
      midSortedTx.amount = inputAmtSentFromWallet;
      let worthNowRaw = currentPrice * (inputAmtSentFromWallet / 100000000);
      midSortedTx.worthNow = convertToDisplayPrice(worthNowRaw, currency);
    } else {
      midSortedTx.txType = "Received";
      midSortedTx.amount = outputAmtAddressedToWallet;
      let worthNowRaw = currentPrice * (outputAmtAddressedToWallet / 100000000);
      midSortedTx.worthNow = convertToDisplayPrice(worthNowRaw, currency);
    }
    midSortedTx.aliens = aliens; // Recepients in a 'Send' txType transaction
    midSortedTx.fees = txObject.fee;
    midSortedTx.inputSize = txObject.vin.length;
    midSortedTx.outputSize = txObject.vout.length;
    midSortedTx.inputs = txObject.vin;
    midSortedTx.outputs = txObject.vout;

    midSortedTxArray.push(midSortedTx);
  }

  // Loop through midSortedTxArray and add worthAtBlockTimestamp property to every object
  // Cannot use foreach because of async restrictions, use normal for instead
  for (let i = 0; i < midSortedTxArray.length; i++) {
    let transaction = midSortedTxArray[i];

    let priceAtBlockTimestamp = await historicPriceFetch(transaction.timestamp, cryptocompareKey, currency);

    let worthAtBlockTimestampRaw = priceAtBlockTimestamp * (transaction.amount / 100000000);

    transaction.worthAtBlockTimestamp = convertToDisplayPrice(worthAtBlockTimestampRaw, currency);

    if (transaction.worthAtBlockTimestamp.substr(transaction.worthAtBlockTimestamp.length - 3) === "NaN") {
      transaction.worthAtBlockTimestamp = "---";
    }
  }

  // Return a descending order version of midSortedTxArray
  return midSortedTxArray.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
};
