const { singleEndpointCall } = require("../util/network_util");

exports.getAddressForIndexTx = async (req, res) => {
  const txId = req.body.lookupData[0];
  const outputIndex = req.body.lookupData[1];

  return res.json(await checkAddressAtIndex(txId, outputIndex));
};

checkAddressAtIndex = async (txid, index) => {
  const data = await singleEndpointCall(
    `https://blockstream.info/api/tx/${txid}`
  ).catch((err) => console.error(err));

  return data.vout[index.scriptpubkey_address];
};
