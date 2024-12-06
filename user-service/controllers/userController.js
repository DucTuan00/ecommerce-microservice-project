const userModel = require('../models/userModel');

exports.register = (req, res) => {
    const { username, password, role_id, email, birthday } = req.body;
    const userRoleId = role_id || 2;

    userModel.register(username, password, userRoleId, email, birthday, (err, user) => {
        if (err) {
            if (err.message === 'Username already exists') {
                return res.status(400).json({ message: 'Username đã tồn tại' });
            }
            return res.status(500).json({ message: `Lỗi trong quá trình tạo tài khoản: ${err}` });
        }
        
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            birthday: user.birthday,
            message: 'User registered successfully'
        });
    });
};

// Đăng nhập
exports.login = (req, res) => {
    const { username, password } = req.body;

    userModel.login(username, password, (err, user) => {
        if (err) {
            if (err.message === 'Có lỗi trong quá trình đăng nhập') {
                return res.status(401).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Có lỗi trong quá trình đăng nhập' });
        }

        // Phát token vào cookie
        res.cookie('token', user.token, {
            httpOnly: false, 
            secure: false,  
            sameSite: 'Lax', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.json({
            id: user.id,
            role: user.role_id,
            token: user.token
        });
    });
};

//Lấy role_id từ user_id
exports.getRoleIdByUserId = (req, res) => {
    const { id } = req.params;

    userModel.getRoleIdByUserId(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Không thể lấy role_id' });
        const roleId = results[0].role_id;
        res.json({ role_id: roleId });
    });
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = (req, res) => {
    userModel.getAllUsers((err, users) => {
        if (err) {
            console.error('Error fetching all users:', err);
            return res.status(500).json({ message: 'Error fetching users' });
        }
        res.status(200).json(users);
    });
};

// Xóa người dùng
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    userModel.deleteUser(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error deleting product' });
        res.json({ message: 'Product deleted successfully' });
    });
};

// Cập nhật thông tin người dùng
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { email, birthday } = req.body;  // Chỉ lấy email và birthday

    // Tạo đối tượng người dùng để cập nhật
    const updatedUser = {
        email,
        birthday
    };

    userModel.updateUser(id, updatedUser, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
        }
        res.json({ message: 'Cập nhật thông tin cá nhân thành công' });
    });
};

exports.getUserById = (req, res) => {
    const userId = req.params.id; // Lấy userId từ params

    // Kiểm tra người dùng có tồn tại không
    userModel.getUserById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    });
};