document.getElementById('reset-sort').addEventListener('click', function() {
    console.log('Reset sort');
    location.reload(true);
});

document.getElementById('resert-search').addEventListener('click', function() {
    console.log('Reset sort');
    location.reload(true);
});

// Biến toàn cục để lưu danh sách sản phẩm
let productList = [];
let currentPage = 1; // Trang hiện tại
const productsPerPage = 12; // Số sản phẩm mỗi trang

// Gọi hàm fetchProducts khi trang load
window.onload = function() {
    fetchProducts();
};

// Hàm fetch dữ liệu sản phẩm từ API
function fetchProducts() {
    fetch('http://localhost:3000/api/product', {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        productList = data; // Lưu tất cả sản phẩm vào mảng
        renderProducts(productList); // Hiển thị sản phẩm ban đầu
        setupPagination(productList);
    })
    .catch(error => {
        console.error('Lỗi khi gọi API:', error);
    });
}

// Hàm render sản phẩm
function renderProducts(products) {
    const productsContainer = document.querySelector('.products-container');
    productsContainer.innerHTML = ''; // Xóa nội dung hiện tại

    // Tính toán index bắt đầu và kết thúc của sản phẩm trên trang hiện tại
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        if (product.active === 1) {
            // Tạo một cột mới cho mỗi sản phẩm
            const productCol = document.createElement('div');
            productCol.className = 'col-md-3 col-sm-6 col-6 mb-3';

            const productItem = document.createElement('div');
            productItem.classList.add('product-item');

            const productImage = document.createElement('img');
            productImage.src = `http://localhost:3000/${product.image}`;
            productImage.alt = product.name;

            const productName = document.createElement('div');
            productName.classList.add('product-name');
            productName.textContent = product.name;

            const productPrice = document.createElement('div');
            productPrice.classList.add('product-price');
            productPrice.textContent = `${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`;

            // Gắn sự kiện click để chuyển hướng
            productItem.addEventListener('click', function () {
                window.location.href = `../viewProduct/viewProduct.html?id=${product.id}`;
            });

            productItem.appendChild(productImage);
            productItem.appendChild(productName);
            productItem.appendChild(productPrice);

            // Thêm productItem vào cột
            productCol.appendChild(productItem);

            // Thêm cột vào productsContainer
            productsContainer.appendChild(productCol);
        }
    });
}

// Hàm tạo phân trang
function setupPagination(products) {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const paginationUl = document.getElementById('pagination');
    paginationUl.innerHTML = ''; // Xóa các nút phân trang cũ

    // Tạo nút "Previous"
    const previousLi = document.createElement('li');
    previousLi.classList.add('page-item');
    const previousLink = document.createElement('a');
    previousLink.classList.add('page-link');
    previousLink.href = '#';
    previousLink.textContent = 'Trang trước';
    previousLink.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts(products);
            updateActivePageButton();
        }
    });
    previousLi.appendChild(previousLink);
    paginationUl.appendChild(previousLi);

    // Tạo các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.classList.add('page-item');
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => {
            currentPage = i;
            renderProducts(products);
            updateActivePageButton();
        });
        pageLi.appendChild(pageLink);
        paginationUl.appendChild(pageLi);
    }

    // Tạo nút "Next"
    const nextLi = document.createElement('li');
    nextLi.classList.add('page-item');
    const nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.href = '#';
    nextLink.textContent = 'Trang sau';
    nextLink.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts(products);
            updateActivePageButton();
        }
    });
    nextLi.appendChild(nextLink);
    paginationUl.appendChild(nextLi);

    updateActivePageButton();
}

// Hàm cập nhật nút trang hiện tại
function updateActivePageButton() {
    const pageItems = document.querySelectorAll('.pagination .page-item');
    pageItems.forEach((item, index) => {
        const pageNum = index;
        if (pageNum === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    // Disable nút Previous khi ở trang đầu tiên
    const previousLi = document.querySelector('.pagination .page-item:first-child');
    if (currentPage === 1) {
        previousLi.classList.add('disabled');
    } else {
        previousLi.classList.remove('disabled');
    }
    // Disable nút Next khi ở trang cuối cùng
    const nextLi = document.querySelector('.pagination .page-item:last-child');
    if (currentPage === Math.ceil(productList.length / productsPerPage)) {
        nextLi.classList.add('disabled');
    } else {
        nextLi.classList.remove('disabled');
    }
}

// Thêm sự kiện click vào các thẻ .category-card
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        const categoryId = card.getAttribute('data-category-id'); // Lấy ID loại sản phẩm
        
        // Gọi API để lấy sản phẩm theo loại tương ứng
        fetch(`http://localhost:3000/api/category/${categoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            productList = data; // Cập nhật danh sách sản phẩm
            renderProducts(productList); // Hiển thị sản phẩm theo loại
            currentPage = 1;
            setupPagination(productList);
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);
        });
    });
});


// Hàm để tìm kiếm sản phẩm
function searchProducts(term) {
    console.log('Sending search term to API:', term); // Log the search term
    fetch(`http://localhost:3000/api/product/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ term }),
    })
    .then(response => {
        if (!response.ok) {
            alert('Không tìm thấy sản phẩm nào');
            fetchProducts();
        }
        return response.json();
    })
    .then(data => {
        productList = data; // Cập nhật danh sách sản phẩm
        renderProducts(productList); // Hiển thị sản phẩm tìm được
        currentPage = 1;
        setupPagination(productList);
    })
    .catch(error => {
        console.error('Lỗi khi gọi API tìm kiếm:', error);
    });
}

// Lấy phần tử input và nút tìm kiếm
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Thêm sự kiện click cho nút tìm kiếm
searchButton.addEventListener('click', function() {
    const searchTerm = searchInput.value.trim(); // Lấy giá trị từ input và loại bỏ khoảng trắng
    if (searchTerm) { // Kiểm tra nếu từ khóa không rỗng
        searchProducts(searchTerm); // Gọi hàm tìm kiếm với giá trị tìm kiếm
    } else {
        console.log('Vui lòng nhập từ khóa tìm kiếm.');
    }
});

function sortProducts(order) {
    console.log('Sắp xếp sản phẩm:', order);
    const sortedProducts = [...productList].sort((a, b) => {
        if (order === 'highToLow') {
            return b.price - a.price;
        } else {
            return a.price - b.price;
        }
    });
    renderProducts(sortedProducts);
    currentPage = 1;
    setupPagination(sortedProducts);
}

function setSelectedButton(button) {
    document.querySelectorAll('.sort-high-to-low, .sort-low-to-high').forEach(btn => {
        btn.classList.remove('selected-button');
    });
    button.classList.add('selected-button');
}

document.getElementById('sort-high-to-low').addEventListener('click', function() {
    sortProducts('highToLow');
    setSelectedButton(this);
});

document.getElementById('sort-low-to-high').addEventListener('click', function() {
    sortProducts('lowToHigh');
    setSelectedButton(this);
});

// Lấy phần tử select box
const filterPriceSelect = document.getElementById('filter-price');

// Thêm sự kiện change cho select box
filterPriceSelect.addEventListener('change', function() {
    const selectedValue = this.value;
    currentPage = 1; // Reset về trang 1 khi lọc
    if (selectedValue === "") {
        renderProducts(productList);
        setupPagination(productList);
    } else if (selectedValue.includes("-")) {
        const [minPrice, maxPrice] = selectedValue.split('-').map(Number);
        filterProductsByPrice(minPrice, maxPrice);
    } else {
        const minPrice = Number(selectedValue);
        filterProductsByPrice(minPrice, Infinity);
    }
});

// Hàm lọc sản phẩm theo giá tiền
function filterProductsByPrice(minPrice, maxPrice) {
    const filteredProducts = productList.filter(product => {
        return product.price >= minPrice && (maxPrice === null || product.price <= maxPrice);
    });
    renderProducts(filteredProducts)
    setupPagination(filteredProducts);
}

