const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
  },
});

exports.Category = mongoose.model("Category", categorySchema);
