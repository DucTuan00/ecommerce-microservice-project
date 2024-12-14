document.getElementById('addProductForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Ngăn chặn submit form truyền thống

    // Lấy dữ liệu từ form
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productImage = document.getElementById('productImage').files[0]; // Dữ liệu file
    const productQuantity = document.getElementById('productQuantity').value;
    const productDescription = document.getElementById('productDescription').value;
    const productCategory = document.getElementById('productCategory').value;

    // Tạo đối tượng FormData để gửi cả dữ liệu text và file
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('image', productImage); // File hình ảnh
    formData.append('quantity', productQuantity);
    formData.append('description', productDescription);
    formData.append('category_id', productCategory);

    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    

    // Lấy token từ cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const Token = token ? token.split('=')[1] : ''; 

    try {
        // Gửi yêu cầu POST đến API
        const response = await fetch('http://localhost:3000/api/product', {
            method: 'POST',
            body: formData, // Gửi FormData
            headers: {
                'Authorization': `Bearer ${Token}` // Sử dụng token từ cookie
            }
        });

        if (response.ok) {
            const result = await response.json();
            // alert('Thêm sản phẩm thành công');
            window.location.href = '../product/product.html'; 
            // Xử lý điều hướng hoặc cập nhật UI nếu cần
        } else {
            const errorData = await response.json();
            alert(`Lỗi: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        alert('Đã xảy ra lỗi khi thêm sản phẩm');
    }
});
