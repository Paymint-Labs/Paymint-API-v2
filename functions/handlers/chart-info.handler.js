const { singleEndpointCall } = require("../util/network_util");
const functions = require("firebase-functions");

exports.getChartInfo = async (req, res) => {
  const currency = req.body.currency;

  return res.json(await getOHLCChart(currency));
};

// Handler logic

getOHLCChart = async (currency) => {
  let candleDataArray = [];
  let dateArray = [];
  //   let minValue;

  const cryptocompareKey = functions.config().cryptocompare.key;
  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=${currency}&limit=150&api_key=${cryptocompareKey}`;

  const response = await singleEndpointCall(url).catch((err) => console.error(err));

  response.Data.Data.forEach((priceBlock) => {
    dateArray.push(new Date(priceBlock.time * 1000).toLocaleDateString());

    const candleArray = [priceBlock.open, priceBlock.close, priceBlock.low, priceBlock.high];

    candleDataArray.push(candleArray);
  });

  return {
    xAxis: dateArray,
    candleData: candleDataArray,
  };
};
