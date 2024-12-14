const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Route tạo thanh toán
router.post("/pay", paymentController.createPayment);

// Route nhận callback từ zalopay-service
router.post("/callback", paymentController.paymentCallback);

module.exports = router;
