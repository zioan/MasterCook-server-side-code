const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./helpers/error-handler");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv/config");
app.use(cookieParser());

// app.use(cors());
// app.options("*", cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://food-online.netlify.app"],
    credentials: true,
  })
);

//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(errorHandler);

//Routers
const usersRouter = require("./routers/users");
const productsRouter = require("./routers/products");
const orderRouter = require("./routers/orders");
const categoriesRouter = require("./routers/categories");
const imagesRouter = require("./routers/images");

app.use(`/user`, usersRouter);
app.use(`/product`, productsRouter);
app.use(`/order`, orderRouter);
app.use(`/category`, categoriesRouter);
app.use(`/image`, imagesRouter);
app.use("/media", express.static("uploads"));

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port:${PORT}`);
});
