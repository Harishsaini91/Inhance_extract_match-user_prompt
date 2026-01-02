// H:\Brain_api\brain\server\models\RawSuggestion.js


const mongoose = require("mongoose");
const BaseSuggestionSchema = require("./BaseSuggestion");

const RawSuggestionSchema = new mongoose.Schema({
  ...BaseSuggestionSchema.obj
});

module.exports = mongoose.model("RawSuggestion", RawSuggestionSchema);
