// Lấy id từ URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

document.addEventListener("DOMContentLoaded", function () {
    const orderId = window.location.pathname.split('/').pop(); // Lấy ID đơn hàng từ URL
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];

    const userRole = localStorage.getItem('userRole');

    function checkUserRole() {
        const statusSelect = document.getElementById("orderStatus");
        const updateStatusBtn = document.getElementById("updateStatusBtn");

        if (userRole !== '1') { // Nếu userRole không phải là admin (khác 1), ẩn select và nút cập nhật
            statusSelect.style.display = "none";
            updateStatusBtn.style.display = "none";
        } else { // Nếu là admin (userRole = 1), hiển thị select và nút cập nhật
            statusSelect.style.display = "inline-block";
            updateStatusBtn.style.display = "inline-block";
        }
    }

    // Kiểm tra xem có orderId không
    if (!orderId) {
        console.error("Không tìm thấy ID đơn hàng trong URL");
        return;
    }

    // Hàm gọi API để lấy chi tiết đơn hàng
    function fetchOrderDetails() {
        fetch(`http://localhost:3000/api/orders/items/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể lấy dữ liệu sản phẩm từ đơn hàng");
                }
                return response.json();
            })
            .then(products => {
                renderProductTable(products); // Hiển thị sản phẩm vào bảng
            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
            });
    }

    // Hàm render dữ liệu sản phẩm vào bảng
    function renderProductTable(products) {
        const productTableBody = document.getElementById("productTableBody");
        productTableBody.innerHTML = ""; // Xóa nội dung cũ trong bảng

        products.forEach(product => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.product_name}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
            `;
            productTableBody.appendChild(tr);
        });
    }

    function updateOrderStatus() {
        const selectedStatus = document.getElementById("orderStatus").value;

        fetch(`http://localhost:3000/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: selectedStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể cập nhật trạng thái đơn hàng");
                }
                return response.json();
            })
            .then(data => {
                alert("Cập nhật thành công"); // Hiển thị thông báo thành công
                fetchOrderInfo(); // Cập nhật lại thông tin đơn hàng trên trang
                window.location.href = '../order/order.html';
            })
            .catch(error => {
                console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
                alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
            });
    }

    // Gắn sự kiện cho nút cập nhật
    document.getElementById("updateStatusBtn").addEventListener("click", updateOrderStatus);


    function fetchOrderInfo() {
        fetch(`http://localhost:3000/api/orders/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể lấy thông tin đơn hàng");
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    renderOrderInfo(data[0]);
                } else {
                    throw new Error("Không tìm thấy thông tin đơn hàng");
                }
            })
            .catch(error => {
                console.error("Lỗi khi lấy thông tin đơn hàng:", error);
            });
    }

    function renderOrderInfo(orderData) {
        const orderDetailsContainer = document.getElementById("order-details-container");

        // Format the date
        const orderDate = new Date(orderData.created_at).toLocaleDateString('vi-VN');

        // Create the HTML content
        const orderInfoHTML = `
            <div class="order-info">
                <p><strong>Mã đơn hàng:</strong> ${orderData.id}</p>
                <p><strong>Ngày đặt hàng:</strong> ${orderDate}</p>
                <p><strong>Người đặt:</strong> ${orderData.username}</p>
                <p><strong>Số điện thoại:</strong> ${orderData.phone_number}</p>
                <p><strong>Địa chỉ nhận hàng:</strong> ${orderData.address}</p>
                <p><strong>Tổng tiền:</strong> ${orderData.total_amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                <p><strong>Trạng thái:</strong> ${renderOrderStatus(orderData.status)}</p>
            </div>
        `;

        // Set the HTML content of the container
        orderDetailsContainer.innerHTML = orderInfoHTML;

        // Update the status select element
        const statusSelect = document.getElementById("orderStatus");
        statusSelect.value = orderData.status;
    }

    // Hàm xử lý trạng thái đơn hàng
    function renderOrderStatus(status) {
        switch (status.toLowerCase()) { // Chuyển đổi trạng thái về chữ thường
            case 'pending':
                return 'Chờ xử lý';
            case 'shipping':
                return 'Đang giao hàng';
            case 'completed':
                return 'Đã giao';
            case 'canceled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    }

    // Gọi API lấy chi tiết đơn hàng khi trang vừa load
    fetchOrderDetails();
    fetchOrderInfo();

    checkUserRole();

    // Xử lý sự kiện khi người dùng nhấn nút cập nhật trạng thái
    document.getElementById("updateStatusBtn").addEventListener("click", updateOrderStatus);
});
