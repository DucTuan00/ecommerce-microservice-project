// product.js
document.addEventListener('DOMContentLoaded', function () {
    let products = []; // Mảng lưu trữ tất cả sản phẩm
    const itemsPerPage = 5; // Số sản phẩm hiển thị trên mỗi trang
    let currentPage = 1; // Trang hiện tại
    let isLoading = true; // Trạng thái loading
    let selectedProductId = null; // ID của sản phẩm được chọn
    const deleteButton = document.getElementById('deleteButton');
    const productTableBody = document.getElementById('productTableBody');
    const paginationContainer = document.getElementById('pagination');

    // Kiểm tra sự tồn tại của các phần tử DOM quan trọng
    if (!deleteButton || !productTableBody || !paginationContainer) {
        console.error('Một hoặc nhiều phần tử DOM quan trọng không tồn tại');
        return;
    }

    // Lấy token từ cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const Token = token ? token.split('=')[1] : '';

        // Hàm ánh xạ ID danh mục sang tên
        function getCategoryName(categoryId) {
            switch (categoryId) {
                case 1: return 'Chảo';
                case 2: return 'Nồi';
                case 3: return 'Máy hút bụi';
                case 4: return 'Bếp';
                case 5: return 'Máy xay';
                default: return 'Không xác định';
            }
        }

    // Hàm fetch dữ liệu sản phẩm từ API
    function fetchProducts() {
        fetch('http://localhost:3000/api/product')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                products = data;
                isLoading = false;
                renderTable();
                renderPagination();
            })
            .catch(error => {
                console.error('Lỗi khi gọi API:', error);
                isLoading = false;
                renderTable(); // Vẫn render table để hiển thị thông báo lỗi
            });
    }

    // Hàm render bảng sản phẩm
    function renderTable() {
        productTableBody.innerHTML = '';

        if (isLoading) {
            productTableBody.innerHTML = '<tr><td colspan="7">Đang tải dữ liệu...</td></tr>';
            return;
        }

        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="7">Không có sản phẩm nào.</td></tr>';
            return;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToShow = products.slice(start, end);

        productsToShow.forEach(product => {
            if (product.active === 1) {
              const row = productTableBody.insertRow();
                const radioCell = row.insertCell();
                const editCell = row.insertCell();
                const nameCell = row.insertCell();
                const priceCell = row.insertCell();
                const categoryCell = row.insertCell();
                const quantityCell = row.insertCell();
                const descriptionCell = row.insertCell();
              
                radioCell.className = 'select-product';
                editCell.className = 'actions-btn';
                radioCell.innerHTML = `<input type="radio" name="selectProduct" class="select-item" value="${product.id}">`;
                 editCell.innerHTML = `<a href="../editProduct/editProduct.html?id=${product.id}" class="edit-btn btn btn-primary btn-sm"><i class="fas fa-edit"></i></a>`;
                nameCell.textContent = product.name;
                priceCell.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
                categoryCell.textContent = getCategoryName(product.category_id);
                quantityCell.textContent = product.quantity;
                descriptionCell.textContent = product.description;
            }
        });

        // Thêm event listener cho radio buttons
        const radioButtons = document.querySelectorAll('.select-item');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.checked) {
                    // Bỏ chọn tất cả các radio button khác
                    radioButtons.forEach(otherRadio => {
                      if (otherRadio !== this) {
                        otherRadio.checked = false;
                      }
                    });
          
                    // Cập nhật ID sản phẩm được chọn
                    selectedProductId = this.value;
                    console.log("Selected Product ID:", selectedProductId);
                    deleteButton.disabled = false;
                  } else {
                    // Nếu radio button này bị bỏ chọn, vô hiệu hóa nút xóa
                    selectedProductId = null;
                    deleteButton.disabled = true;
                  }
            });
        });
    }

    // Hàm render phân trang
    function renderPagination() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(products.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-btn', 'btn', 'btn-light');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderTable();
                updateActivePagination();
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    // Hàm cập nhật trạng thái active cho nút phân trang
    function updateActivePagination() {
        const pageButtons = document.querySelectorAll('.page-btn');
        pageButtons.forEach((button, index) => {
             button.classList.remove('active');
            if (index + 1 === currentPage) {
                button.classList.add('active');
            }
        });
    }

    // Hàm xóa sản phẩm
    function deleteProduct(id) {
        if (!id) {
            console.error('No product ID provided for deletion');
            alert('Có lỗi xảy ra: Không có ID sản phẩm để xóa.');
            return;
        }

        fetch(`http://localhost:3000/api/product/delete/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                    });
                }else{ 
                    fetchProducts();
                }
                return response.json();
            })
            .then(data => {
                console.log('Xóa thành công:', data);
                products = products.filter(product => product.id !== id);
                selectedProductId = null;
                deleteButton.disabled = true;
                renderTable();
                renderPagination();
                alert('Sản phẩm đã được xóa thành công.');
            })
            .catch(error => {
                console.error('Chi tiết lỗi:', error);
            });
    }

    // Event listener cho nút xóa
    deleteButton.addEventListener('click', function () {
        if (selectedProductId) {
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                deleteProduct(selectedProductId);
            }
        } else {
            alert('Vui lòng chọn một sản phẩm để xóa.');
        }
    });

    // Khởi tạo dữ liệu ban đầu
    fetchProducts();
});