const axios = require("axios");

exports.createPayment = async (req, res) => {
  const { orderId, amount } = req.body;

  // Gửi yêu cầu đến zalopay-service
  try {
    const response = await axios.post("http://localhost:8888/payment", {
      orderId,
      amount,
    });

    // Trả về thông tin thanh toán
    return res.status(200).json({
      message: "Payment created successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error while calling ZaloPay service:", error.message);
    return res.status(500).json({ message: "Payment creation failed" });
  }
}
