// Lấy token từ cookie
const token = document.cookie.split('; ').find(row => row.startsWith('token='));
const Token = token ? token.split('=')[1] : '';

// Lấy thông tin giỏ hàng từ server
async function fetchCart() {
    
    if (!Token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            }
        });

        console.log('Response:', response);
        
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin giỏ hàng');
        }
        const cartData = await response.json();
        console.log('Cart Data:', cartData);

        return cartData;
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
    }
}

async function fetchProducts(productIds) {
    try {
        const response = await fetch(`http://localhost:3000/api/product?ids=${productIds.join(',')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin sản phẩm');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        return null;
    }
}

async function loadCartAndProducts() {
    const cartData = await fetchCart();
    
    // Lấy tất cả product_id từ cartData
    const productIds = cartData.map(item => item.product_id);

    if (productIds.length >= 0) {
        // Gọi fetchProducts với danh sách productIds
        const productData = await fetchProducts(productIds);
        renderCart(cartData, productData);
    } else {
        console.error('Giỏ hàng trống hoặc không có sản phẩm.');
    }
}

loadCartAndProducts();

// Hiển thị giỏ hàng
function renderCart(cartData, productData) {
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = '';

    if (Array.isArray(cartData)) {
        let total = 0;

        cartData.forEach(item => {
            // Tìm sản phẩm trong mảng `productData` dựa trên `product_id`
            const product = productData.find(p => p.id === item.product_id);
            if (product) {
                if (product.active === 1) {
                    const itemElement = createCartItemElement(item, product);
                    cartItemsContainer.appendChild(itemElement);

                    total += item.total_money;
                } else {
                    removeItem(item.id);
                }
            } else {
                console.warn(`Không tìm thấy sản phẩm với ID: ${item.product_id}`);
            }
        });

        // Tính toán tổng số tiền
        updateCartTotal(total);

    } else {
        console.error('Dữ liệu giỏ hàng không hợp lệ.');
    }
}

// Tạo phần tử HTML cho mỗi sản phẩm trong giỏ hàng
function createCartItemElement(item, product) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');

    const productImage = document.createElement('img');
    productImage.src = `../../product-service/${product.image}`; //Lấy đường dẫn ảnh

    itemElement.innerHTML = `
        <img src="${productImage.src}" alt="${product.name}" class="product-image">
        <div class="item-details">
            <h3 class="product-name">${product.name}</h3>
            <div class="quantity-controls">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-quantity" data-id="${item.id}">+</button>
            </div>
            <p class="product-price">${formatCurrency(item.total_money)}</p>
            <button class="remove-item" data-id="${item.id}">Xóa</button>
        </div>
    `;

    // Thêm sự kiện cho nút tăng số lượng
    itemElement.querySelector('.increase-quantity').addEventListener('click', () => {
        updateCartItemQuantity(item.id, item.quantity + 1);
    });

    // Thêm sự kiện cho nút giảm số lượng
    itemElement.querySelector('.decrease-quantity').addEventListener('click', () => {
        if (item.quantity > 1) {
            updateCartItemQuantity(item.id, item.quantity - 1);
        }
    });

    return itemElement;
}

async function updateCartItemQuantity(cartId, newQuantity) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({ quantity: newQuantity }),
        });

        if (!response.ok) {
            throw new Error('Failed to update cart item');
        }

        const updatedCartItem = await response.json();
        
        loadCartAndProducts(); //Cập nhật lại giỏ hàng
    } catch (error) {
        console.error('Error updating cart item:', error);
        alert('Không thể cập nhật số lượng sản phẩm.');
    }
}

// Cập nhật tổng giá trị giỏ hàng
function updateCartTotal(total) {
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total); // Hoặc định dạng theo cách bạn muốn
    } else {
        console.error('Không tìm thấy phần tử tổng trong giao diện.');
    }
}

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Xử lý sự kiện xóa sản phẩm
async function removeItem(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            }
        });
        console.log(response);
        if (!response.ok) {
            throw new Error('Không thể xóa sản phẩm');
        } else {
            loadCartAndProducts(); //Cập nhật lại giỏ hàng
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
    }
}

// Thêm sự kiện cho các nút trong giỏ hàng
document.querySelector('.cart-items').addEventListener('click', (event) => {
    const target = event.target;
    const cartId = target.dataset.id;

    if (target.classList.contains('remove-item')) {
        removeItem(cartId);
    }
});

// Hàm xử lý gọi api thanh toán
async function handlePayment(orderId) {
    try {
        const response = await fetch("http://localhost:3000/api/order/payment", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({ order_id: orderId }) // Gửi order_id qua API
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Thanh toán thất bại");
        }

        const responseData = await response.json();
        // Xử lý kết quả trả về từ API (ví dụ: link thanh toán từ ZaloPay)
        if (responseData.payment_link) {
            window.location.href = responseData.payment_link; // Chuyển hướng tới link thanh toán
        } else {
            alert("Thanh toán thành công!"); // Hoặc xử lý theo yêu cầu
        }
    } catch (error) {
        console.error("Lỗi thanh toán:", error.message);
        alert("Thanh toán thất bại: " + error.message);
    }
}

async function createOrder() {
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const isZaloPay = document.getElementById('zalopay').checked; // Kiểm tra xem ZaloPay có được chọn không
    
    if (!phone || !address) {
        alert('Vui lòng nhập đầy đủ số điện thoại và địa chỉ.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({
                phone_number: phone,
                address: address
            })
        });
        if (!response.ok) {
            const errorData = await response.json(); // Giả sử API trả về JSON chứa thông tin lỗi, bao gồm product_id

            // Nếu có lỗi về số lượng trong kho, tiếp tục lấy thông tin sản phẩm bằng product_id
            if (errorData.message && errorData.message.includes('Not enough stock')) {
                const productId = errorData.message.match(/\d+/)[0]; // Lấy product_id từ message (dạng số)

                // Gọi API để lấy thông tin sản phẩm dựa trên product_id
                const productResponse = await fetch(`http://localhost:3000/api/product/${productId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Token}`
                    }
                });

                if (productResponse.ok) {
                    const productData = await productResponse.json();
                    console.log(productData);
                    alert(`Bạn đã đặt quá số lượng trong kho của sản phẩm: ${productData.name}`);
                } else {
                    alert('Lỗi không thể lấy thông tin sản phẩm');
                }
            } else {
                alert('Lỗi không xác định. Không thể tạo đơn hàng.');
            }

            throw new Error('Không thể tạo đơn hàng');
        }

        const orderData = await response.json(); // Nhận order data trả về, bao gồm order ID
        console.log(orderData.order_id);

        if (isZaloPay) {
            // Xử lý thanh toán ZaloPay
            handlePayment(orderData.order_id); // Truyền order ID vào hàm handlePayment
        } else {
            alert('Đặt hàng thành công!');
            window.location.href = '/client/order/order.html';
        }
    } catch (error) {
        console.log('Lỗi khi tạo đơn hàng', error);
    }
}

// Gắn sự kiện cho nút đặt hàng
document.addEventListener('DOMContentLoaded', () => {
    const orderButton = document.getElementById('order-button');

    // Gắn sự kiện click cho nút "Đặt hàng"
    orderButton.addEventListener('click', () => {
        createOrder();
    });

    fetchCart();
});

// document.querySelector('.create-order').addEventListener('click', (event) => {
//     //Không cho thẻ <a> thực hiện chuyển hướng mặc định
//     event.preventDefault();
//     createOrder();
// })

// // Khởi tạo giỏ hàng khi trang được tải
// document.addEventListener('DOMContentLoaded', fetchCart);