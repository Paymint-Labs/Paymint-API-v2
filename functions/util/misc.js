// Miscellaneous helper functions that can't be grouped into any specific category

/**
 * Returns a date string associated with [unix_timestamp]
 * @param {number} unix_timestamp
 */
exports.extractDateFromTimestamp = (unix_timestamp) => {
  let milliseconds = unix_timestamp * 1000;
  let dateObject = new Date(milliseconds);
  return dateObject.toLocaleDateString();
};

/**
 * Converts the price to the proper display format
 * @param {number} price
 * @param {string} currency
 */
exports.convertToDisplayPrice = (price, currency) => {
  let UnitedStatesFormat = new Intl.NumberFormat("en-US", {
    currency: currency,
    style: "currency",
  });
  return UnitedStatesFormat.format(price);
};
