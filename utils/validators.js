var validator = require("validator");
var isEmail = (email) => validator.isEmail(email);
var isNumeric = (text) => validator.isNumeric(text);
var isEnglish = (text) => validator.isAlpha(text);
var isDate = (text) => validator.isDate(text);
module.exports = {
  isEmail,
  isNumeric,
  isEnglish,
  isDate,
};
