const { singleEndpointCall } = require("../util/network_util");

exports.getFeeDensity = async (req, res) => {
  const url = req.body.url;
  return res.json(await fetchCurrentFeeDensity(url));
};

// Handler logic

fetchCurrentFeeDensity = async (url) => {
  const feeRatesPerBlocktime = await singleEndpointCall(
    `${url}/fee-estimates`
  ).catch((err) => console.error(err));

  let feeObj = {};

  feeObj["very-fast"] = feeRatesPerBlocktime["1"];
  feeObj["fast"] = feeRatesPerBlocktime["3"];
  feeObj["average"] = feeRatesPerBlocktime["5"];
  feeObj["slow"] = feeRatesPerBlocktime["7"];
  feeObj["very-slow"] = feeRatesPerBlocktime["9"];
  return feeObj;
};
