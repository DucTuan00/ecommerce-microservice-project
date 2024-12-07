const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Thư mục lưu trữ ảnh
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Đặt tên file
    }
});

const upload = multer({ storage });

router.get('/', productController.getProducts);

router.post('/search', productController.searchProducts);

router.get('/:id', productController.getProductById);

router.post('/', authMiddleware(['1']), upload.fields([{ name: 'image' }]), productController.createProduct);

router.put('/:id', authMiddleware(['1']), upload.fields([{ name: 'image'}]), productController.updateProduct);

router.put('/delete/:id', authMiddleware(['1']), productController.deleteProduct);

module.exports = router;