const express = require("express");
const { Product } = require("../models/product");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../helpers/auth");

router.get("/", async (req, res) => {
  const productList = await Product.find(); //return the entire

  if (!productList) res.status(500).json({ success: false });
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    res.status(500).json({ success: false, message: "Product not found" });
  res.send(product);
});

router.get("/find/:category", async (req, res) => {
  const product = await Product.find({ category: req.params.category });
  if (!product)
    res.status(500).json({
      success: false,
      message: "Product not found on this category",
    });
  res.send(product);
});

router.post("/", auth, async (req, res) => {
  try {
    let product = new Product({
      name: req.body.name,
      number: req.body.number,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      isFeatured: req.body.isFeatured,
      isAvailable: req.body.isAvailable,
    });
    product = await product.save();

    if (!product) res.status(500).send("The product cannot be created!");

    res.send(product);
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid product id!");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      number: req.body.number,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      isFeatured: req.body.isFeatured,
      isAvailable: req.body.isAvailable,
    },
    { new: true } // get back the new data updated
  );
  if (!product) return res.status(400).send("the product cannot be updated!");
  res.send(product);
});

router.delete("/:id", auth, (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount)
    res.status(404).json({ success: false, message: "No products to count" });
  res.send({ productCount: productCount });
});

router.get("/get/featured", async (req, res) => {
  const products = await Product.find({ isFeatured: true });
  if (!products)
    res.status(404).json({ success: false, message: "No featured products" });
  res.send(products);
});

//how many featured to return
router.get("/get/featured/:count", async (req, res) => {
  // const count = req.params.count ? req.params.count : 0
  const count = req.params.count;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products)
    res.status(404).json({ success: false, message: "No featured products" });
  res.send(products);
});

module.exports = router;
