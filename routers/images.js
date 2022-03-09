const express = require("express");
const { Image } = require("../models/image");
const router = express.Router();
const fs = require("fs");

//*// image upload
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  const imageList = await Image.find();

  if (!imageList) res.status(404).json({ success: false });
  res.send(imageList);
});

// "image" in the middleware represents the name of the input field
// eg <input name="image" type="file" />
// the form must include enctype="multipart/form-data"
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imgPath = new Image({ img: req.file.filename });

    imgPath = await imgPath.save();
    res.send(imgPath);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id/:path", async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    const path = req.params.path;
    fs.unlinkSync(`./uploads/${path}`);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/img/:path", async (req, res) => {
  const path = req.params.path;
  try {
    fs.unlinkSync(`./uploads/${path}`);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
