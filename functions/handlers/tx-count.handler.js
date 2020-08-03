const { singleEndpointCall } = require("../util/network_util");

exports.getTxCountForAddress = async (req, res) => {
  const address = req.body.address;
  const url = req.body.url;
  return res.json(await txCountLookup(address, url));
};

// Handler Logic

txCountLookup = async (address, url) => {
  const data = await singleEndpointCall(`${url}/address/${address}/txs`);
  return data.length;
};
