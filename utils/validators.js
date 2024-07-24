var validator = require("validator");
var isEmail = (email) => validator.isEmail(email);
var isNumeric = (text) => validator.isNumeric(text);
var isEnglish = (text) => validator.isAlpha(text);
var isDate = (text) => validator.isDate(text);
//Update event.js in model folder if you want to change this
var isEventType = (text) => {
  var eventTypes = ["movie", "activity", "event"];
  return eventTypes.includes(text);
};
var isActivityType = (text) => { 
  var activityTypes = ["outdoor", "indoor"];

  return activityTypes.includes(text);
};
module.exports = {
  isEmail,
  isNumeric,
  isEnglish,
  isDate,
  isEventType,
  isActivityType,
};
