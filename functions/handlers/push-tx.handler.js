const axios = require("axios").default;

exports.pushTransaction = async (req, res) => {
  const hex = req.body.hex;
  const url = req.body.url;

  return res.json(await sendHexToNetwork(hex, url));
};

// Handler logic

sendHexToNetwork = async (hex, url) => {
  const res = await axios
    .post(`${url}/tx`, hex)
    .then((response) => response.data)
    .catch((err) => console.error(err));

  return res;
};
