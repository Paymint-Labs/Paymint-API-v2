const axios = require("axios");
const { multiEndpointCall } = require("../util/network_util");

exports.getOutputDataForWallet = (req, res) => {
  const allAddresses = req.body.allAddresses;
  const currency = req.body.currency;

  
};

// Handler logic below