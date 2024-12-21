// Lấy ID từ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id'); // Ví dụ URL là ?id=123 thì lấy được id = 123

// Hàm gọi API và hiển thị thông tin thể loại sản phẩm
async function fetchCategoryDetails(categoryId) {
    try {
        const response = await fetch(`http://localhost:3000/api/category/category/${categoryId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch category');
        }
        const category = await response.json();
        console.log(category);

        // Cập nhật nội dung HTML với dữ liệu từ API
        document.querySelector('.product-category').textContent = `Danh mục: ${category.name}`;
    } catch (error) {
        console.error('Error fetching category details:', error);
        // Hiển thị thông báo lỗi (nếu có)
    }
}

// Hàm gọi API và hiển thị thông tin sản phẩm
async function fetchProductDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/product/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        const product = await response.json();
        console.log(product);

        // Cập nhật nội dung HTML với dữ liệu từ API
        document.querySelector('.product-name').textContent = `${product.name}`;
        document.querySelector('.product-price').textContent = `Giá: ${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`;
        document.querySelector('.product-description').textContent = `Mô tả: ${product.description}`;
        document.querySelector('.product-quantity').textContent = `Số lượng còn trong kho: ${product.quantity}`;
        
        // Gọi hàm để lấy thông tin thể loại sản phẩm
        fetchCategoryDetails(product.category_id).then((category) => {
            if (category) {
                document.querySelector('.product-category').textContent = `Thể loại: ${category.name}`;
            }
        });

        // Cập nhật hình ảnh nếu có
        const productImage = document.querySelector('.product-image');
        productImage.src = `../../product-service/${product.image}`;
        productImage.alt = product.name;

            // Add event listeners for quantity increment/decrement and Add to Cart button
            const quantityInput = document.querySelector('.quantity-input');
            const decrementButton = document.querySelector('.quantity-decrement');
            const incrementButton = document.querySelector('.quantity-increment');
            const addToCartButton = document.querySelector('.add-to-cart');
    
            decrementButton.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
    
            incrementButton.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
            });
    
            addToCartButton.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10);
            
                if (isNaN(quantity) || quantity <= 0) {
                    alert('Vui lòng nhập số lượng hợp lệ.');
                    return;
                }
            
                createCart(product.id, quantity);
            });

            // Gọi hàm để lấy và hiển thị sản phẩm liên quan
            fetchRelatedProducts(product.category_id);

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// Hàm gọi API để lấy sản phẩm liên quan
async function fetchRelatedProducts(categoryId) {
    try {
        const response = await fetch(`http://localhost:3000/api/product/category?category_id=${categoryId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch related products');
        }
        const products = await response.json();
        renderRelatedProducts(products);
    } catch (error) {
        console.error('Error fetching related products:', error);
    }
}

// Hàm hiển thị sản phẩm liên quan
function renderRelatedProducts(products) {
    const relatedProductsList = document.querySelector('.related-products-list');
    relatedProductsList.innerHTML = '';
    let currentIndex = 0;
    const productsPerView = 5; // Số sản phẩm hiển thị mỗi lần

    products.forEach(product => {
        if (product.id == productId) return;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <a href="viewProduct.html?id=${product.id}" class="d-block">
                <img src="../../product-service/${product.image}" class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body">
                <a href="viewProduct.html?id=${product.id}"><h6 class="card-title">${product.name}</h6></a>
                <p class="card-text text-danger fw-bold">${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
        `;
        relatedProductsList.appendChild(card);
    });

    const updateSlider = () => {
        const firstCard = relatedProductsList.querySelector('.card');
        if (!firstCard) {
            console.error("No cards found in the related products list.");
            return;
        }

        let cardWidth = firstCard.offsetWidth + parseInt(getComputedStyle(firstCard).marginRight);
        const translateX = -currentIndex * cardWidth;
        relatedProductsList.style.transform = `translateX(${translateX}px)`;
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= products.length - productsPerView;
    };

    const prevButton = document.querySelector('.prev-related-products');
    const nextButton = document.querySelector('.next-related-products');

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < products.length - productsPerView) {
            currentIndex++;
            updateSlider();
        }
    });

    updateSlider();
    window.addEventListener('resize', updateSlider);
}

// Lấy token từ cookie
const token = document.cookie.split('; ').find(row => row.startsWith('token='));
const Token = token ? token.split('=')[1] : '';

async function createCart(product_id, quantity) {
    const data = {
        product_id: product_id,
        quantity: quantity
    };

    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            }
        });

        if (response.ok) {
            const cart = await response.json();
            alert("Đã thêm vào giỏ hàng");
        } else {
            const errorData = await response.json();
            alert(`Vui lòng đăng nhập để thêm vào giỏ hàng!`);
        }
    } catch (error) {
        console.log('Lỗi khi thêm vào giỏ hàng', error);
        alert('Đã xảy ra lỗi khi thêm vào giỏ hàng');
    }
}

// Gọi hàm để lấy thông tin sản phẩm khi trang được tải
if (productId) {
    fetchProductDetails();
} else {
    console.error('No product ID found in the URL');
}
