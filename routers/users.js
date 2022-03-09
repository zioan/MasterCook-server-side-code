const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const userList = await User.find().select("name email");

  if (!userList) res.status(500).json({ success: false });
  res.send(userList);
});

router.get("/couriers", async (req, res) => {
  try {
    const courierList = await User.find({ isCourier: true });

    if (!courierList) res.status(500).json({ success: false });
    res.send(courierList);
  } catch (err) {
    console.log(err);
  }
});

router.post("/register", async (req, res) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    address: req.body.address,
    zipCode: req.body.zipCode,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    isCourier: req.body.isCourier,
    isCustomer: req.body.isCustomer,
  });

  //check if there is another account with the same email
  const existingUser = await User.findOne({ email: newUser.email });
  if (existingUser) {
    return res.status(400).json({
      errorMessage: "An account with this email already exists.",
    });
  }

  const user = await newUser.save();
  if (!newUser) return res.status(404).send("the user cannot be created");

  const token = jwt.sign(
    {
      id: user._id,
      userName: user.name,
      address: user.address,
      zipCode: user.zipCode,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isCourier: user.isCourier,
      isCustomer: user.isCustomer,
    },
    process.env.SECRET
  );

  //set cookie
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite:
        process.env.NODE_ENV === "development"
          ? "lax"
          : process.env.NODE_ENV === "production" && "none",
      secure:
        process.env.NODE_ENV === "development"
          ? false
          : process.env.NODE_ENV === "production" && true,
    })
    .status(200)
    .send({
      userEmail: user.email,
      userName: user.name,
      token: token,
      isCustomer: user.isCustomer,
      address: user.address,
      phone: user.phone,
    });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("User not found");

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        id: user._id,
        userName: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isCourier: user.isCourier,
        isCustomer: user.isCustomer,
        address: user.address,
        zipCode: user.zipCode,
        phone: user.phone,
      },
      process.env.SECRET,
      {
        expiresIn: "1d", //one day is "1d" /"1w"...
      }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
      })
      .status(200)
      .send({
        userEmail: user.email,
        userName: user.name,
        userId: user._id,
        token: token,
        isAdmin: user.isAdmin,
        isCourier: user.isCourier,
        isCustomer: user.isCustomer,
        address: user.address,
        zipCode: user.zipCode,
      });
  } else {
    res.status(400).send("Password is wrong");
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.put("/updateUser/:id", async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        zipCode: req.body.zipCode,
        phone: req.body.phone,
      },
      { new: true }
    );
    if (!userData) return res.status(400).send("User info cannot be updated!");
    res.status(200).send(userData);
  } catch (err) {
    console.log(err);
  }
});

router.put("/updateUserPassword/:id", async (req, res) => {
  try {
    const userPassword = await User.findByIdAndUpdate(req.params.id, {
      passwordHash: bcrypt.hashSync(req.body.password, 10),
    });
    if (!userPassword)
      return res.status(400).send("User password cannot be updated!");
    res.status(200);
  } catch (err) {
    console.log(err);
  }
});

//check if the user is logedin and returns the user id (usefull in frontend)
router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(null);

    const validatedUser = jwt.verify(token, process.env.SECRET);
    console.log(validatedUser);
    res.send(validatedUser);
    // res.send(validatedUser.userName);
  } catch (err) {
    return res.json(null);
  }
});

//logout user
router.get("/logOut", (req, res) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
        expires: new Date(0),
      })
      .send();
  } catch (err) {
    return res.json(null);
  }
});
module.exports = router;

// test
