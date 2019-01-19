var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: {
    type: String,
    unique: [true, "Title cannot be a duplicate"],
    required: true
  },
  body: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var article = mongoose.model("article", articleSchema);
module.exports = article;