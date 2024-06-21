var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();

//user
//admin
//backdoor

var port = process.env.PORT;

app.listen(port, (err) => {
  if (err) console.log(err);
  else console.log(`Server listening to port ${port}`);
});
