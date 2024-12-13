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

// Kiểm tra token khi trang load
window.onload = function() {
    fetchProducts(); // Lấy tất cả sản phẩm khi tải trang
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
    })
    .catch(error => {
        console.error('Lỗi khi gọi API:', error);
    });
}

// Hàm render sản phẩm
function renderProducts(products) {
    const productsContainer = document.querySelector('.products-container');
    productsContainer.innerHTML = ''; // Xóa nội dung hiện tại

    products.forEach(product => {
        if (product.active === 1) {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');

            const productImage = document.createElement('img');
            productImage.src = `../../product-service/${product.image}`;
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

            productsContainer.appendChild(productItem);
        }
    });
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

function filterProductsByPrice(minPrice, maxPrice) {
    const filteredProducts = productList.filter(product => {
        return product.price >= minPrice && (maxPrice === null || product.price <= maxPrice);
    });
    renderProducts(filteredProducts);
}

document.getElementById('filter-0-1m').addEventListener('click', function() {
    filterProductsByPrice(0, 1000000);
    setSelectedButton(this);
});

document.getElementById('filter-1m-10m').addEventListener('click', function() {
    filterProductsByPrice(1000000, 10000000);
    setSelectedButton(this);
});

document.getElementById('filter-10m-plus').addEventListener('click', function() {
    filterProductsByPrice(10000000, null);
    setSelectedButton(this);
});

document.getElementById('reset-filter').addEventListener('click', function() {
    renderProducts(productList);
    setSelectedButton(this);
});

function setSelectedButton(button) {
    document.querySelectorAll('.sort-high-to-low, .sort-low-to-high, .price-filter').forEach(btn => {
        btn.classList.remove('selected-button');
    });
    button.classList.add('selected-button');
}

