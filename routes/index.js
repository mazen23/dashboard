const express = require("express");
const router = express.Router();

import fs from "fs";

router.get("/", function(req, res, next) {
  response.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("dist/index.html", null, function(error, data) {
    if (error) {
      response.writeHead(404);
      response.write("File not found!");
    } else {
      response.write(data);
    }
    response.end();
  });
});

module.exports = router;
