const orderModel = require('../models/orderModel');
const axios = require('axios');

exports.createOrder = async (req, res) => {
    const user_id = req.userId;
    const { phone_number, address } = req.body;
    const status = "pending";

    try {
        // Lấy giỏ hàng từ Cart Service
        const cartResponse = await axios.get(`http://localhost:3004/api/cart`,
            {
                headers: { Authorization: req.headers.authorization } // Forward token từ client
            }
        );
        const cartItems = cartResponse.data;

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Kiểm tra tồn kho từng sản phẩm từ Product Service
        for (const item of cartItems) {
            const productResponse = await axios.get(`http://localhost:3003/api/product/${item.product_id}`);
            const product = productResponse.data;

            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for product ID ${item.product_id}` });
            }
        }

        // Cập nhật tồn kho
        for (const item of cartItems) {
            await axios.put(`http://localhost:3003/api/product/quantity/${item.product_id}`, 
                {
                    quantity: -item.quantity // Trừ số lượng trong kho
                },
                {
                    headers: { Authorization: req.headers.authorization } // Forward token từ client
                });
        }

        
        // Tính tổng tiền
        const total_amount = cartItems.reduce((sum, item) => sum + item.total_money, 0);

        // Tạo đơn hàng
        orderModel.createOrder(user_id, total_amount, status, phone_number, address, async (err, orderResult) => {
            if (err) return res.status(500).json({ message: 'Error creating order' });
        
            const order_id = orderResult.insertId; // Lấy ID của đơn hàng mới tạo
        
            try {
                for (const item of cartItems) {
                    await new Promise((resolve, reject) => {
                        orderModel.addOrderItems(order_id, item.product_id, item.quantity, item.total_money, (err) => {
                            if (err) {
                                console.error(`Failed to add item: ${item.product_id}`, err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                }
        
                // Xóa giỏ hàng
                await axios.delete(`http://localhost:3004/api/cart/clear`, {
                    headers: { Authorization: req.headers.authorization }
                });
                console.log('Cart cleared successfully');
                res.status(201).json({ message: 'Order created successfully', order_id });
            } catch (error) {
                console.error('Error processing order:', error);
                res.status(500).json({ message: 'Error processing order' });
            }
        });
            
    } catch (error) {
        console.error('Error create order:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Internal server error'
        });
    }
};