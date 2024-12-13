const db = require('../config/db');

const createOrder = (user_id, total_amount, status, phone_number, address, callback) => {
    db.query('INSERT INTO orders (user_id, total_amount, status, phone_number, address) VALUES (?, ?, ?, ?, ?)', 
        [user_id, total_amount, status, phone_number, address], callback);
};

// Hàm thêm sản phẩm vào order_items
const addOrderItems = (order_id, product_id, quantity, price, callback) => {
    db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
        [order_id, product_id, quantity, price], callback);
};

module.exports = {
    createOrder,
    addOrderItems,
};