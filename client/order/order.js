document.addEventListener("DOMContentLoaded", function () {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const Token = token ? token.split('=')[1] : '';
    const userRole = localStorage.getItem('userRole');

    let allOrders = []; // Store all orders
    const itemsPerPage = 7; // Number of orders per page
    let currentPage = 1; // Current page

    function fetchOrders() {
        console.log('fetchOrders called');
        let apiUrl = '';
    
        console.log('userRole:', userRole);
    
        if (userRole === '1') {
            apiUrl = 'http://localhost:3000/api/order';
        } else if (userRole === '2') {
            apiUrl = 'http://localhost:3000/api/order/getUserOrder';
        }
    
        console.log('Fetching orders from:', apiUrl);
    
        if (apiUrl) {
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Token}`
                }
            })
            .then(response => {
                console.log('Response received:', response);
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(orders => {
                console.log('Parsed orders:', orders);
                if (orders.length === 0) {
                    console.warn('No orders found.');
                } else {
                    // Sắp xếp đơn hàng theo ngày đặt hàng (mới nhất trước)
                    allOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    renderOrderTable();  // Render first page
                    renderPagination();  // Render pagination
                }
            })
            .catch(error => {
                console.error("Lỗi khi lấy đơn hàng:", error);
            });
        } else {
            console.error("userRole không hợp lệ.");
        }
    }
    
    function renderOrderTable() {
        const orderTableBody = document.getElementById("orderTableBody");
        orderTableBody.innerHTML = ""; // Clear existing data

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const ordersToShow = allOrders.slice(startIndex, endIndex);

        ordersToShow.forEach(order => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${order.username}</td>
                <td>${order.phone_number}</td>
                <td>${order.address}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.total_amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td>${renderOrderStatus(order.status)}</td>
                <td class="actions-btn">
                    ${userRole === '1' ? `
                        <a href="../order-detail/order-detail.html?id=${order.id}" class="edit-btn btn btn-primary btn-sm"><i class="fas fa-edit"></i></a>
                        <button class="cancel-btn btn btn-danger btn-sm" data-id="${order.id}"><i class="fas fa-ban"></i></button>
                    ` : ''}
                    ${userRole === '2' ? `
                        <a href="../order-detail/order-detail.html?id=${order.id}" class="edit-btn btn btn-info btn-sm"><i class="fas fa-eye"></i></a>
                        <button class="cancel-btn btn btn-danger btn-sm" data-id="${order.id}"><i class="fas fa-ban"></i></button>
                    ` : ''}
                </td>
            `;

            orderTableBody.appendChild(tr);

            const cancelBtn = tr.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    const orderId = cancelBtn.getAttribute('data-id');
                    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
                        cancelOrder(orderId);
                    }
                });
            }
        });
    }

    function renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(allOrders.length / itemsPerPage);
        const ul = document.createElement('ul');
        ul.classList.add('pagination');


        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            if (i === currentPage) {
              li.classList.add('active');
            }
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('page-link')
            button.addEventListener('click', () => {
                currentPage = i;
                renderOrderTable();
                renderPagination();
            });
            li.appendChild(button)
            ul.appendChild(li);
        }
        paginationContainer.appendChild(ul);
    }

    function cancelOrder(orderId) {
        fetch(`http://localhost:3000/api/order/cancel/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Hủy đơn hàng thành công');
                fetchOrders(); // Refresh the order list
            } else {
                alert('Không thể hủy vì đơn hàng đã được xử lý!');
            }
        })
        .catch(error => {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Đã xảy ra lỗi khi hủy đơn hàng');
        });
    }

    //lấy ra 2 thuộc tính trong url để kiểm tra, sau đó thay đổi trạng thái
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('paymentStatus'); // Lấy trạng thái thanh toán
    const order_id = urlParams.get('id'); // Lấy id đơn hàng

    if (paymentStatus === 'success' && order_id) {
        updateOrderStatusToPaid(order_id);
    }

    function updateOrderStatusToPaid(orderId) {
        fetch(`http://localhost:3000/api/order/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({ status: 'paid' }) // Cập nhật trạng thái thành 'paid'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Không thể cập nhật trạng thái đơn hàng");
            }
            return response.json();
        })
        .then(data => {
            alert("Thanh toán thành công!");
            fetchOrders(); // Gọi lại hàm để render thông tin đơn hàng
        })
        .catch(error => {
            console.error("Lỗi cập nhật trạng thái thanh toán:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.");
        });
    }
    
    function renderOrderStatus(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Chờ xử lý';
            case 'shipping':
                return 'Đang giao hàng';
            case 'paid':
                return 'Đã thanh toán';
            case 'completed':
                return 'Đã giao';
            case 'canceled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    }

    // Sort orders by status
    document.querySelector(".statusHeader").addEventListener('click', () => {
        allOrders.sort((a, b) => {
            const statusOrder = {
                'pending': 1,
                'paid': 2,
                'shipping': 3,
                'completed': 4,
                'canceled': 5
            };
            return statusOrder[a.status] - statusOrder[b.status];
        });
        currentPage = 1; // Reset to first page after sorting
        renderOrderTable();
        renderPagination();
    });

    // Initial fetch of orders
    fetchOrders();
});