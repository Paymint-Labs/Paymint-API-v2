const { singleEndpointCall } = require("../util/network_util");

exports.getFeeDensity = async (req, res) => {
  const url = req.body.url;
  return res.json(await fetchCurrentFeeDensity(url));
};

// Handler logic

fetchCurrentFeeDensity = async (url) => {
  const feeRatesPerBlocktime = await singleEndpointCall(`${url}/fee-estimates`).catch((err) => console.error(err));

  let feeObj = {};

  feeObj["very-fast"] = parseFloat(feeRatesPerBlocktime["1"].toFixed(2));
  feeObj["fast"] = parseFloat(feeRatesPerBlocktime["3"].toFixed(2));
  feeObj["average"] = parseFloat(feeRatesPerBlocktime["5"].toFixed(2));
  feeObj["slow"] = parseFloat(feeRatesPerBlocktime["7"].toFixed(2));
  feeObj["very-slow"] = parseFloat(feeRatesPerBlocktime["9"].toFixed(2));
  return feeObj;
};
