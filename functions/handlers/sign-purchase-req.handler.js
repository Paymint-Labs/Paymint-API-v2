// import crypto from "crypto";

const crypto = require("crypto");

// Handler logic

const axios = require("axios").default;

exports.signPurchaseRequest = async (req, res) => {
  const hex = req.body.hex;
  const url = req.body.url;

  return res.json(this.createPurchaseSignature(url));
};

// Handler logic

exports.createPurchaseSignature = (url) => {
  const signature = crypto
    .createHmac("sha256", "sk_live_Tk5E6sZaes0OYCGJcU3jbvyL0kc2H0")
    .update(new URL(url).search)
    .digest("base64");

  const urlWithSignature = `${url}&signature=${encodeURIComponent(signature)}`;

  return urlWithSignature;
};
