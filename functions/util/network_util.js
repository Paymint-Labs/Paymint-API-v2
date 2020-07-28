// The following functions are network utility/helper functions to be used wherever necessary.

const axios = require("axios").default;
const { admin, db } = require('./admin');

/**
 * Returns the result of the HTTP endpoint passed to [url]
 * @param {string} url
 */
exports.singleEndpointCall = (url) => {
  return axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.error(err));
};

/**
 * Returns an array containing the responses after calling singleEndpointCall()
 * on each item of [endpointArray]
 * @param {string[]} endpointArray
 */
exports.multiEndpointCall = (endpointArray) => {
  let responseArray = endpointArray.map(singleEndpointCall);
  return axios.all(responseArray).catch((err) => console.error(err));
};
