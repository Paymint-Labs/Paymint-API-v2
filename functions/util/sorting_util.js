// The following functions are sorting utility/helper functions to be used wherever necessary

/**
 * Returns true if the transaction id, [idToCheckFor] exists in the
 * transaction array passed to the function, [txArrayToCheckFrom]
 *
 * Returns false otherwise
 * @param {array} txArrayToCheckFrom
 * @param {string} idToCheckFor
 */
exports.duplicateTransactionCheck = (txArrayToCheckFrom, idToCheckFor) => {
  for (let i = 0; i < txArrayToCheckFrom.length; i++) {
    if (txArrayToCheckFrom[i].txid == idToCheckFor) {
      return true;
    }
  }
  return false;
};

/**
 * Expects the response from sortTransactionArray as input [txArray]. Returns
 * the expected output of /txData
 * @param {array} txArray
 */
exports.buildDatetimeChunks = (txArray) => {
  let finalDictionary = { dateTimeChunks: [] };
  let dateArray = [];
  let orderedList = [];

  txArray.forEach((txObject) => {
    let timestampDate = this.extractDateFromTimestamp(txObject.timestamp);
    let txTimeArray = [txObject.timestamp, timestampDate];

    if (dateArray.includes(txTimeArray[1])) {
      finalDictionary.dateTimeChunks.forEach((chunk) => {
        if (this.extractDateFromTimestamp(chunk.timestamp) == txTimeArray[1]) {
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
  });

  finalDictionary.dateTimeChunks.forEach((dateTimeChunk) => {
    if (!dateTimeChunk.timestamp) {
      orderedList.push(dateTimeChunk);
    }
  });

  finalDictionary.dateTimeChunks.forEach((dateTimeChunk) => {
    if (dateTimeChunk.timestamp) {
      orderedList.push(dateTimeChunk);
    }
  });

  return { dateTimeChunks: orderedList };
};

/**
 * Returns something - fill this in later
 * @param {array} txArray
 * @param {string[]} internalAndChangeAddrArray
 * @param {string} currency
 * @param {string[]} changeAddresses
 */
exports.sortTransactionArray = async (
  txArray,
  internalAndChangeAddrArray,
  currency,
  changeAddresses
) => {
  let midSortedTxArray = [];
  let currentPrice = await this.getBitcoinPrice(currency);

  txArray.forEach(async (txObject) => {
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
    const foundInSenders = internalAndChangeAddrArray.some((address) =>
      sendersArray.includes(address)
    );

    // If txType = Sent, then calulate inputAmtSentFromWallet, calculate who received how much in aliens array (check outputs)
    if (foundInSenders) {
      txObject.vin.forEach((input) => {
        if (
          internalAndChangeAddrArray.includes(
            input.prevout.scriptpubkey_address
          )
        ) {
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
      // If txType = Received, then calculate output amount addressed to user controlled addresses - (internalAndChangeAddrArray)
    } else if (!foundInSenders) {
      txObject.vout.forEach((output) => {
        if (internalAndChangeAddrArray.includes(output.scriptpubkey_address)) {
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
      midSortedTx.worthNow = this.convertToDisplayPrice(worthNowRaw, currency);
    } else {
      midSortedTx.txType = "Received";
      midSortedTx.amount = outputAmtAddressedToWallet;
      let worthNowRaw = currentPrice * (outputAmtAddressedToWallet / 100000000);
      midSortedTx.worthNow = this.convertToDisplayPrice(worthNowRaw, currency);
    }
    midSortedTx.aliens = aliens; // Recepients in a 'Send' txType transaction
    midSortedTx.fees = txObject.fee;
    midSortedTx.inputSize = txObject.vin.length;
    midSortedTx.outputSize = txObject.vout.length;
    midSortedTx.inputs = txObject.vin;
    midSortedTx.outputs = txObject.vout;

    midSortedTxArray.push(midSortedTx);
  });

  // Loop through midSortedTxArray and add worthAtBlockTimestamp property to every object
  // Cannot use foreach because of async-await restrictions, use normal for instead
  for (let i = 0; i < midSortedTxArray.length; i++) {
    let transaction = midSortedTxArray[i];
    let priceAtBlockTimestamp = await this.getBitcoinPrice(
      currency,
      transaction.timestamp
    );
    let worthAtBlockTimestampRaw =
      priceAtBlockTimestamp * (transaction.amount / 100000000);
    transaction.worthAtBlockTimestamp = this.convertToDisplayPrice(
      worthAtBlockTimestampRaw,
      currency
    );
  }

  // Return a descending order version of midSortedTxArray
  return midSortedTxArray.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
};
