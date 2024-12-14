// nav.js
const checkAndDisplayProductLink = () => {

    const roleId = localStorage.getItem('userRole'); // Lấy roleId từ localStorage

    // Nếu roleId là '1', hiển thị các tab chức năng cho admin
    if (roleId === '1') {
        document.getElementById('product-link').style.display = 'block';
        document.getElementById('statistical-link').style.display = 'block';
        document.getElementById('userManager-link').style.display = 'block';
        document.getElementById('home-link').style.display = 'none';
        document.getElementById('cart-link').style.display = 'none';
    } else {
        document.getElementById('product-link').style.display = 'none';
        document.getElementById('statistical-link').style.display = 'none';
        document.getElementById('userManager-link').style.display = 'none';
    }
};
