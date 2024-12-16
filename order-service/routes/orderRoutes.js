const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['2']), orderController.createOrder);

router.get('/getUserOrder', authMiddleware(['2']), orderController.getUserOrders);

router.get('/items/:id', authMiddleware(['1','2']), orderController.getAllOrderItemsByOrderId);

router.get('/:id', authMiddleware(['1','2']), orderController.getOrderById);

router.put('/:id', authMiddleware(['1']), orderController.updateOrderStatus);

router.get('/', authMiddleware(['1']), orderController.getAllOrders);

router.put('/cancel/:order_id', authMiddleware(['1','2']), orderController.cancelOrder);

module.exports = router