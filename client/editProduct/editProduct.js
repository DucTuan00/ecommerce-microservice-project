// Lấy id từ URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

// Kiểm tra xem id có tồn tại hay không
if (id) {
    // Gọi API để lấy thông tin sản phẩm
    fetch(`http://localhost:3000/api/product/${id}`)
        .then(response => response.json())
        .then(data => {
            // Cập nhật thông tin sản phẩm vào form
            document.getElementById('productName').value = data.name;
            document.getElementById('productPrice').value = data.price;
            document.getElementById('productQuantity').value = data.quantity;
            document.getElementById('productDescription').value = data.description;
            document.getElementById('productCategory').value = data.category_id;

            // Hiển thị ảnh từ đường dẫn
            const productImageInput = document.getElementById('productImage');
            productImageInput.value = '';
            const imagePreview = document.createElement('img');
            imagePreview.src = `../../product-service/${data.image}`;
            imagePreview.style.width = '100px';
            imagePreview.style.height = '100px';
            productImageInput.parentNode.appendChild(imagePreview);

            console.log(data.image);

            // Nếu có ảnh, thêm vào input nhập ảnh
            if (data.image) {
                const reader = new FileReader();
                reader.onload = () => {
                    const imageData = reader.result;
                    productImageInput.value = imageData;
                };
                reader.readAsDataURL(data.image);
            }
        })
        .catch(error => console.error('Lỗi khi lấy thông tin sản phẩm:', error));
} else {
    console.error('Không tìm thấy id trong URL');
}

document.getElementById('addProductForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Ngăn chặn submit form truyền thống

    // Lấy dữ liệu từ form
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productImage = document.getElementById('productImage').files[0];
    const productQuantity = document.getElementById('productQuantity').value;
    const productDescription = document.getElementById('productDescription').value;
    const productCategory = document.getElementById('productCategory').value;


    // Tạo đối tượng FormData để gửi cả dữ liệu text và file
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('quantity', productQuantity);
    formData.append('description', productDescription);
    formData.append('category_id', productCategory);

    console.log(productImage);

    // Chỉ thêm trường ảnh nếu có ảnh
    if (productImage) {
        formData.append('image', productImage); // File hình ảnh
    }

    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    
    // Lấy token từ cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const Token = token ? token.split('=')[1] : ''; 

    try {
        // Gửi yêu cầu PATCH đến API
        const response = await fetch(`http://localhost:3000/api/product/${id}`, {
            method: 'PUT',
            body: formData, // Gửi FormData
            headers: {
                'Authorization': `Bearer ${Token}` // Sử dụng token từ cookie
            }
        });

        if (response.ok) {
            const result = await response.json();
            alert('Sửa sản phẩm thành công');
            window.location.href = '../product/product.html'; 
            // Xử lý điều hướng hoặc cập nhật UI nếu cần
        } else {
            const errorData = await response.json();
            alert(`Lỗi: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        alert('Đã xảy ra lỗi khi cập nhật sản phẩm');
    }
});