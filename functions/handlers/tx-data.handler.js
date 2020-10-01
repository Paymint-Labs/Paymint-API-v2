const { multiEndpointCall } = require("../util/network_util");
const { buildDatetimeChunks, duplicateTransactionCheck, sortTransactionArray } = require("../util/sorting_util");

exports.getTransactionDataForWallet = async (req, res) => {
  const allAddresses = req.body.allAddresses;
  let currency = req.body.currency;
  let changeArray = req.body.changeAddresses;

  return res.json(await transactionDataLookup(allAddresses, currency, changeArray, req.body.url));
};

// Handler logic

transactionDataLookup = async (allAddresses, currency, changeArray, url) => {
  const endpointArray = [];
  const allTxsArray = [];

  allAddresses.forEach((address) => {
    endpointArray.push(`${url}/address/${address}/txs`);
  });

  await multiEndpointCall(endpointArray)
    .then((responseArray) => {
      for (let i = 0; i < responseArray.length; i++) {
        const txArray = responseArray[i];

        for (let j = 0; j < txArray.length; j++) {
          const tx = txArray[j];
          if (duplicateTransactionCheck(allTxsArray, tx.txid) === false) allTxsArray.push(tx);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });

  const sortedTxArray = await sortTransactionArray(allTxsArray, allAddresses, currency, changeArray);

  const data = buildDatetimeChunks(sortedTxArray);

  let orderedList = [];

  data.dateTimeChunks.forEach((dateTimeChunk) => {
    if (!dateTimeChunk.timestamp) {
      orderedList.push(dateTimeChunk);
    }
  });

  data.dateTimeChunks.forEach((dateTimeChunk) => {
    if (dateTimeChunk.timestamp) {
      orderedList.push(dateTimeChunk);
    }
  });

  return { dateTimeChunks: orderedList };
};
