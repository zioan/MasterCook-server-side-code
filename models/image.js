const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  img: {
    type: String,
  },
});
// const imageSchema = mongoose.Schema({
//   img:{data:Buffer,contentType: String}
// });

exports.Image = mongoose.model("Image", imageSchema);
