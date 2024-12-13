const cartModel = require('../models/cartModel');
const axios = require('axios');

//Thêm vào giỏ hàng
exports.createCart = async (req, res) => {
    const user_id = req.userId;
    const { product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        //Kiểm tra user tồn tại qua User Service
        const userResponse = await axios.get(
            `http://localhost:3002/api/user/getUser/${user_id}`,
            {
                headers: { Authorization: req.headers.authorization } // Forward token từ client
            }
        );
        if (userResponse.status !== 200) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra product tồn tại qua Product Service
        const productResponse = await axios.get(`http://localhost:3003/api/product/${product_id}`);
        if (productResponse.status !== 200) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productResponse.data;
        const total_money = product.price * quantity;

        cartModel.createCart(user_id, product_id, quantity, total_money, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error creating cart' });
            res.status(201).json({
                id: result.insertId,
                user_id,
                product_id,
                quantity,
                total_money,
            });
        });
    } catch (error) {
        console.error('Error creating cart:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Internal server error'
        });
    }
};

//Xóa 1 sản phẩm trong giỏ hàng
exports.deleteCart = async (req, res) => {
    const user_id = req.userId;
    const id = req.params.id || req.params[1];

    try {
        //Kiểm tra user tồn tại qua User Service
        const userResponse = await axios.get(
            `http://localhost:3002/api/user/getUser/${user_id}`,
            {
                headers: { Authorization: req.headers.authorization } // Forward token từ client
            }
        );
        if (userResponse.status !== 200) {
            return res.status(404).json({ message: 'User not found' });
        }

        cartModel.getCartById(id, (err, cart) => {
            if (err) return res.status(500).json({ message: 'Error fetching cart' });
            if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
            // Nếu cart là một mảng, lấy phần tử đầu tiên
            const cartData = Array.isArray(cart) ? cart[0] : cart;
    
            // Kiểm tra để đảm bảo giỏ hàng đúng người sở hữu
            if (parseInt(cartData.user_id) !== parseInt(user_id)) {
                return res.status(403).json({ message: 'You do not have permission to delete this cart' })
            }
    
            cartModel.deleteCart(id, user_id, (err, result) => {
                if (err) return res.status(500).json({ message: 'Error deleting from cart' });
                res.status(200).json({ message: `Delete cart with id: ${id}` });
            });
        });
    } catch (error) {
        console.error('Error deleting cart:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Internal server error'
        });
    }
};

// Lấy tất cả giỏ hàng từ id người dùng
exports.getCart = async (req, res) => {
    const user_id = req.userId;

    try {
        //Kiểm tra user tồn tại qua User Service
        const userResponse = await axios.get(
            `http://localhost:3002/api/user/getUser/${user_id}`,
            {
                headers: { Authorization: req.headers.authorization } // Forward token từ client
            }
        );
        if (userResponse.status !== 200) {
            return res.status(404).json({ message: 'User not found' });
        }

        cartModel.getCartByUserId(user_id, (err, cartItems) => {
            if (err) return res.status(500).json({ message: 'Error fetching cart' });
            res.status(200).json(cartItems);
        });
    } catch (error) {
        console.error('Error getting cart:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || 'Internal server error'
        });
    }
};

//Cập nhật giỏ hàng
exports.updateCart = async (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;

    if (!id || quantity === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    try {
        //Lấy thông tin giá của product để tính lại total_money
        cartModel.getCartById(id, async (err, cart) => {
            if (err) return res.status(500).json({ message: 'Error fetching cart' });
            if (!cart) return res.status(404).json({ message: 'Cart not found' });

            const product_id = cart[0].product_id;

            const productResponse = await axios.get(`http://localhost:3003/api/product/${product_id}`);
            if (productResponse.status !== 200) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            const product = productResponse.data;
            const newTotalMoney = product.price * quantity;

            cartModel.updateCart(id, quantity, newTotalMoney, (err, result) => {
                if (err) return res.status(500).json({ message: 'Failed to update cart' });
                res.status(200).json({
                    message: 'Cart updated successfully',
                    id: parseInt(id),
                    updatedFields: {
                        quantity,
                        total_money: newTotalMoney,
                    },
                });
            });
        });
    } catch (error) {
        console.error('Error updating cart:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.clearCart = async (req, res) => {
    const user_id = req.userId;

    try {
        //Kiểm tra user tồn tại qua User Service
        const userResponse = await axios.get(
            `http://localhost:3002/api/user/getUser/${user_id}`,
            {
                headers: { Authorization: req.headers.authorization } // Forward token từ client
            }
        );
        if (userResponse.status !== 200) {
            return res.status(404).json({ message: 'User not found' });
        }

        cartModel.clearCart(user_id, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error clear carts' });
            res.status(200).json({ message: 'Clear cart succesfully' });
        });
    } catch (error) {
        console.error('Error clearing cart:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};