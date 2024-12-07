const categoryModel = require('../models/categoryModel');

// Xem tất cả các category
exports.getCategories = (req, res) => {
    categoryModel.getAllCategories((err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching categories' });
        res.json(results);
    });
};

// Lấy sản phẩm theo category ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;

    categoryModel.getProductsByCategoryId(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products for category' });
        res.json(results);
    });
};

// Lấy thông tin của category theo ID
exports.getCategoryName = (req, res) => {
    const { id } = req.params; // Lấy id từ URL

    categoryModel.getCategoryById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching category details' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(result[0]); // Trả về thông tin của category
    });
};


// Thêm category
exports.createCategory = (req, res) => {
    const { name } = req.body;

    categoryModel.createCategory(name, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error creating category' });
        res.status(201).json({
            id: results.insertId,
            name: name,
            message: 'Category created successfully'
        });
    });
};

// Sửa category
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    categoryModel.updateCategory(id, name, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error updating category' });
        res.json({ message: 'Category updated successfully' });
    });
};

// Xóa category
exports.deleteCategory = (req, res) => {
    const { id } = req.params;

    categoryModel.deleteCategory(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error deleting category' });
        res.json({ message: 'Category deleted successfully' });
    });
};