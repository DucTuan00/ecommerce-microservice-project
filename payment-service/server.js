const express = require("express");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/payment");

const app = express();
app.use(bodyParser.json());

// Payment routes
app.use("/orders", paymentRoutes);

// Server start
app.listen(8080, () => {
  console.log("Order service is running on port 8080");
});
