var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var swagger = require("./utils/swagger");
/////////
var admin = require("./RestApi/routes/admin");
var user = require("./RestApi/routes/user");
var event = require("./RestApi/routes/event");
////////
var app = express();
require("dotenv").config();

mongoose
  .connect(process.env.DB, {
    // authSource: "admin",
  })
  .then(() => {
    console.log("Connected To MongoDb");
  })
  .catch((e) => {
    console.error("Could not Connect To MongoDb");
    console.error(e);
  });
process.on("uncaughtException", function (err) {
  console.log(err);
  console.log("Caught exception: ");
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
//TODO add route for booking

app.use("/admin", admin);
app.use("/user", user);
app.use("/event", event);
app.use("/api-docs", swagger);

//user
//admin
//backdoor

var port = process.env.PORT;

app.listen(port, (err) => {
  if (err) console.log(err);
  else console.log(`Server listening On Port ${port}`);
});
