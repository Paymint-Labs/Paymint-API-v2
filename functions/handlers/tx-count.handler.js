const { singleEndpointCall } = require("../util/network_util");

exports.getTxCountForAddress = async (req, res) => {
  const address = req.body.address;
  return res.json(await txCountLookup(address));
};

// Handler Logic

txCountLookup = async (address) => {
  const data = await singleEndpointCall(
    `https://blockstream.info/api/address/${address}/txs`
  );
  return data.length;
};
