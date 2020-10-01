const { singleEndpointCall } = require("../util/network_util");

exports.getAddressForIndexTx = async (req, res) => {
  const txId = req.body.lookupData[0];
  const outputIndex = req.body.lookupData[1];
  const url = req.body.url;

  return res.json(await checkAddressAtIndex(txId, outputIndex, url));
};

checkAddressAtIndex = async (txid, index, url) => {
  const data = await singleEndpointCall(`${url}/tx/${txid}`).catch((err) => console.error(err));

  return data.vout[index].scriptpubkey_address;
};
