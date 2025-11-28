const express = require("express");
const router = express.Router();
const { getCoordsFromAddress } = require("../controllers/apisController")

router.get("/address", getCoordsFromAddress);

module.exports = router;