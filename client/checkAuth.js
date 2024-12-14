// Hàm để lấy giá trị của cookie theo tên
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Kiểm tra token khi trang load
window.onload = function() {
    const token = getCookie('token'); // Lấy cookie có tên 'token'

    if (!token) {
        // Chuyển hướng tới trang login nếu không có token
        window.location.href = '../login/login.html';
    }
};
