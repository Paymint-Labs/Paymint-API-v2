const { singleEndpointCall } = require("../util/network_util");
const functions = require("firebase-functions");

exports.getMarketInfo = async (req, res) => {
  const currency = req.body.currency;

  return res.json(await fetchMarketInfo(currency));
};

// Handler logic

fetchMarketInfo = async (currency) => {
  const nomicsKey = functions.config().nomics.key;
  let finalStr = ``;

  const data = await singleEndpointCall(
    `https://api.nomics.com/v1/currencies/ticker?key=${nomicsKey}&ids=BTC&interval=1d,7d,30d&convert=${currency}`
  );

  const currentPriceRaw = Number(data[0].price);
  const marketCapRaw = Number(data[0].market_cap);
  const allTimeHighRaw = Number(data[0].high);
  const dayPriceChangePercentage = data[0]["1d"].price_change_pct + "%";
  const dayPriceChangeRaw = data[0]["1d"].price_change;
  const weekPriceChangePercentage = data[0]["7d"].price_change_pct + "%";
  const weekPriceChangeRaw = data[0]["7d"].price_change;

  const currentPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(currentPriceRaw);

  const marketCap = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(marketCapRaw);

  const allTimeHigh = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(allTimeHighRaw);

  const dayPriceChange = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(dayPriceChangeRaw);

  const weekPriceChange = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(weekPriceChangeRaw);

  finalStr += "Price: " + currentPrice + "    ";
  finalStr +=
    "24hr price change: " +
    dayPriceChange +
    ` (${dayPriceChangePercentage})    `;
  finalStr +=
    "Week price change: " +
    weekPriceChange +
    ` (${weekPriceChangePercentage})    `;
  finalStr += "Market Cap: " + marketCap + "    ";
  finalStr += "All time high: " + allTimeHigh + "    ";

  return finalStr;
};
