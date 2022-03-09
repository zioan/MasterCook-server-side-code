const express = require("express");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
const auth = require("../helpers/auth");

//get all orders
router.get("/", auth, async (req, res) => {
  try {
    const orderList = await Order.find();
    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get all orders from specific day
router.get("/totalDay/:date", auth, async (req, res) => {
  try {
    const orderList = await Order.find({ filterDateOrdered: req.params.date });
    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get specific user orders
router.get("/get/userOrders/:userid", auth, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    })
    .sort({ dateOrdered: -1 }); //lattest first
  if (!userOrderList) res.status(500).json({ success: false });
  res.send(userOrderList);
});

//get orders by status
router.get("/:status", auth, async (req, res) => {
  try {
    const orderList = await Order.find({ status: req.params.status });

    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get orders by status per day
router.get("/:status/:date", auth, async (req, res) => {
  try {
    const orderList = await Order.find({
      status: req.params.status,
      filterDateOrdered: req.params.date,
    });

    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get orders by status and courier
router.get("/courier/:status/:courier", auth, async (req, res) => {
  try {
    const orderList = await Order.find({
      status: req.params.status,
      courier: req.params.courier,
    });

    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get orders by status, courier and date
router.get("/courier/get/:status/:courier/:date", auth, async (req, res) => {
  try {
    const orderList = await Order.find({
      status: req.params.status,
      courier: req.params.courier,
      filterDateOrdered: req.params.date,
    });

    if (!orderList) res.status(500).json({ success: false });
    res.send(orderList);
  } catch (err) {
    console.log(err);
  }
});

//get a order by id
router.get("/:id", auth, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name address phone id")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });

  if (!order) res.status(500).json({ success: false });
  res.send(order);
});

//create a new order
router.post("/", async (req, res) => {
  try {
    let order = new Order({
      orderItems: req.body.orderItems,
      user: req.body.user,
      userName: req.body.userName,
      deliveryAddress: req.body.deliveryAddress,
      zip: req.body.zip,
      phone: req.body.phone,
      totalOrder: req.body.totalOrder,
      extra: req.body.extra,
      orderInternalId: new Date().getTime().toString(),
      dateOrdered: new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      filterDateOrdered: new Date().toISOString().substring(0, 10),
    });
    order = await order.save();

    if (!order) return res.status(400).send("the order cannot be created!");

    console.log(order);
    res.send(order);
  } catch (err) {
    console.log(err);
  }
});

//update order status
router.put("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        courier: req.body.courier,
      },
      { new: true } // get back the new data updated
    );
    if (!order)
      return res.status(404).send("the order cannot be found/updated!");
    res.send(order);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id", auth, (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", auth, async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales)
    return res.status(400).send("The order sales cannot be generated");

  res.send({ totalSales: totalSales });
});

//count how many orders
router.get("/get/count", auth, async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount)
    res.status(404).json({ success: false, message: "No orders to count" });
  res.send({ orderCount: orderCount });
});
module.exports = router;
