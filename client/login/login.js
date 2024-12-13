document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = '';

        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;

        if (!passwordRegex.test(password)) {
            errorMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự và chứa ít nhất 1 ký tự đặc biệt.';
            return;
        }

    const payload = {
        username: username,
        password: password
    };

    try {
        const response = await fetch('http://localhost:3000/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include'  // Cho phép gửi và nhận cookies
        });

        const data = await response.json();

        if (response.ok) {
            // Lưu token vào cookie
            document.cookie = `token=${data.token}; path=/; SameSite=Lax; Secure; max-age=86400`; 
            // max-age=86400 là thời gian sống của cookie (1 ngày)

            // Lưu thông tin người dùng vào localStorage (nếu cần)
            localStorage.setItem('userId', data.id);
            localStorage.setItem('userRole', data.role);

            // Kiểm tra cookie
            console.log('Cookies:', document.cookie);

            // Chuyển hướng
            if (data.role === 1) {
                window.location.href = '../product/product.html';
            } else {
                window.location.href = '../home/home.html'; 
            }
        } else {
            errorMessage.textContent = data.message || 'An error occurred. Please try again.';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Failed to log in. Please check your connection and try again.';
    }
});
