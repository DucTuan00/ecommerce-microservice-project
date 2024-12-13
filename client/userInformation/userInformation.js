// Lấy token từ cookie
const token = document.cookie.split('; ').find(row => row.startsWith('token='));
const Token = token ? token.split('=')[1] : '';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('user-info-form');

    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId');

    // Gửi yêu cầu lấy thông tin người dùng
    fetch(`http://localhost:3000/api/user/getUser/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Giả định data trả về là một mảng và lấy phần tử đầu tiên
        const user = data[0];

        // Điền thông tin vào các trường trong form
        document.getElementById('username').value = user.username; // Username
        document.getElementById('role').value = user.role;       // Role
        document.getElementById('email').value = user.email;     // Email
        document.getElementById('birthday').value = user.birthday.split("T")[0]; // Birthday (Chỉ lấy phần ngày)
    })
    .catch(error => {
        console.error('Error fetching user:', error);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Ngăn chặn hành động mặc định của form

        const email = document.getElementById('email').value;
        const birthday = document.getElementById('birthday').value;

        // Gửi yêu cầu cập nhật thông tin người dùng
        fetch(`http://localhost:3000/api/user/update/${userId}`, { // Cập nhật đường dẫn API
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({ email, birthday }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message); // Hiển thị thông báo thành công
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Đã xảy ra lỗi khi cập nhật thông tin.');
        });
    });
});
