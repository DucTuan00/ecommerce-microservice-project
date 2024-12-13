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
            apiUrl = 'http://localhost:3000/api/orders';
        } else if (userRole === '2') {
            apiUrl = 'http://localhost:3000/api/orders/getUserOrder';
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
                    allOrders = orders; // Store all orders
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
                        <a href="../order-detail/order-detail.html?id=${order.id}" class="edit-btn"><i class="fas fa-edit"></i></a>
                        <button class="cancel-btn" data-id="${order.id}"><i class="fas fa-ban"></i></button>
                    ` : ''}
                    ${userRole === '2' ? `
                        <a href="../order-detail/order-detail.html?id=${order.id}" class="edit-btn"><i class="fas fa-eye"></i></a>
                        <button class="cancel-btn" data-id="${order.id}"><i class="fas fa-ban"></i></button>
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

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.toggle('active', i === currentPage);
            button.addEventListener('click', () => {
                currentPage = i;
                renderOrderTable();
                renderPagination();
            });
            paginationContainer.appendChild(button);
        }
    }

    function cancelOrder(orderId) {
        fetch(`http://localhost:3000/api/orders/cancel/${orderId}`, {
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
                alert('Hủy đơn hàng thất bại vì đơn hàng đang giao hoặc đã được giao!');
            }
        })
        .catch(error => {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Đã xảy ra lỗi khi hủy đơn hàng');
        });
    }
    
    function renderOrderStatus(status) {
        switch (status.toLowerCase()) {
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

    // Sort orders by status
    document.querySelector(".statusHeader").addEventListener('click', () => {
        allOrders.sort((a, b) => {
            const statusOrder = {
                'pending': 1,
                'shipping': 2,
                'completed': 3,
                'canceled': 4
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