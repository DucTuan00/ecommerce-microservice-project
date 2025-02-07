const productModel = require('../models/productModel');

// Lấy tất cả sản phẩm
exports.getProducts = (req, res) => {
    productModel.getAllProducts((err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products' });
        res.json(results);
    });
};

// Lấy 1 sản phẩm
exports.getProductById = (req, res) => {
    const { id } = req.params;
    productModel.getProductById(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error getting product' });
        res.json(results);
    });
}

exports.getProductsByCategory = (req, res) => {
    const category_id = req.query.category_id;
    productModel.getProductsByCategory(category_id, (err, products) => {
        if (err) return res.status(500).json({ message: 'Error fetching products by category' });
        res.json(products);
    });
}

// Thêm sản phẩm
exports.createProduct = (req, res) => {
    const { name, price, description, category_id, quantity } = req.body;

        const image = req.files.image ? req.files.image[0] : null;
        const imagePath = image ? image.path : null;
        const active = 1;

    productModel.createProduct(name, price, imagePath, description, category_id, quantity, active, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error creating product' });
        }

        res.status(201).json({
            id: results.insertId,
            name,
            price,
            imagePath,
            description,
            category_id,
            quantity,
            active,
            message: 'Product created successfully'
        });
    });
};

// Cập nhật sản phẩm
exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, price, description, category_id, quantity } = req.body;

    // Kiểm tra xem có file ảnh được tải lên không
    const image = req.files && req.files.image ? req.files.image[0] : null;
    const imagePath = image ? image.path : null;

    // Nếu không có imagePath, chỉ cập nhật các trường khác
    if (imagePath) {
        // Trường hợp có ảnh, cập nhật tất cả các trường
        productModel.updateProduct(id, name, price, imagePath, description, category_id, quantity, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error updating product' });
            }
            res.status(201).json({
                name,
                price,
                imagePath,
                description,
                category_id,
                quantity,
            });
        });
    } else {
        // Trường hợp không có ảnh, bỏ qua việc cập nhật imagePath
        productModel.updateProductWithoutImage(id, name, price, description, category_id, quantity, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error updating product' });
            }
            res.status(201).json({
                name,
                price,
                description,
                category_id,
                quantity,
            });
        });
    }
};

// Xóa sản phẩm
exports.deleteProduct = (req, res) => {
    const { id } = req.params;

    productModel.deleteProduct(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error deleting product' });
        res.json({ message: 'Product deleted successfully' });
    });
};

// Tìm kiếm sản phẩm
exports.searchProducts = (req, res) => {
    const { term } = req.body; // Lấy trực tiếp term từ req.body

    if (term) {
        // Nếu có term, tìm kiếm sản phẩm theo tên hoặc mô tả
        productModel.searchProducts(term, (err, products) => {
            if (err) {
                console.error('Error searching products:', err);
                return res.status(500).json({ message: 'Error searching products' });
            }

            if (products.length === 0) {
                return res.status(404).json({ message: 'Không có sản phẩm nào' });
            }

            return res.status(200).json(products);
        });
    } else {
        // Nếu không có term, trả về tất cả sản phẩm
        productModel.getAllProducts((err, products) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).json({ message: 'Error fetching products' });
            }
            return res.status(200).json(products);
        });
    }
};

exports.updateProductQuantity = (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body; // quantity có thể là số âm để giảm tồn kho

    try {
        productModel.getProductById(id, (err, product) => {
            if (err) return res.status(500).json({ message: 'Error getting product' });
            
            // Tính số lượng mới
            const newQuantity = product.quantity + quantity;
            if (newQuantity < 0) {
                return res.status(400).json({ message: 'Not enough stock' });
            }
            
            productModel.updateProductQuantity(id, newQuantity, (err, results) => {
                if (err) return res.status(500).json({ message: 'Can not update quantity' });
                res.status(200).json({ message: 'Product quantity updated successfully', newQuantity });
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};