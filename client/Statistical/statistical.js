document.addEventListener("DOMContentLoaded", function () {
    // Lấy token từ cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    const Token = token ? token.split('=')[1] : '';

    const yearSelector = document.getElementById('year');
    const barChart = document.querySelector('.bar-chart');

    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();
    yearSelector.value = currentYear; // Đặt giá trị mặc định của select là năm hiện tại

    // Gọi hàm fetchStatisticalData với năm hiện tại khi trang được tải
    fetchStatisticalData(currentYear);

    // Lắng nghe sự kiện khi người dùng chọn năm
    yearSelector.addEventListener('change', function () {
        const selectedYear = yearSelector.value;
        fetchStatisticalData(selectedYear);
    });

    // Hàm gọi API để lấy dữ liệu thống kê theo năm
    function fetchStatisticalData(year) {
        fetch(`http://localhost:3000/api/statistical`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify({ year: year }) // Gửi năm được chọn đến server
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dữ liệu thống kê:', data);
                updateBarChart(data); // Hàm cập nhật biểu đồ với dữ liệu mới
            })
            .catch(error => {
                console.error('Lỗi khi gọi API:', error);
            });
    }

    function updateBarChart(data) {
        // Xóa các thanh cũ
        barChart.innerHTML = '';
    
        // Tìm tổng doanh thu tháng cao nhất
        const maxTotal = Math.max(...data.map(item => item.total_amount));
    
        // Tạo và cập nhật thanh cho mỗi tháng
        data.forEach(item => {
            const bar = document.createElement('div');
            const barHeight = Math.round((item.total_amount / maxTotal) * 400); // Tính chiều cao cột
            bar.classList.add('bar');
            bar.style.height = `${barHeight}px`; // Điều chỉnh chiều cao để phù hợp với khung biểu đồ
    
            // Tạo nhãn tháng
            const monthLabel = document.createElement('div');
            monthLabel.textContent = `Tháng ${item.month}`;
            monthLabel.classList.add('bar-label');
    
            // Tạo nhãn giá trị doanh thu
            const amountLabel = document.createElement('div');
            amountLabel.textContent = item.total_amount.toLocaleString(); // Định dạng doanh thu
            amountLabel.classList.add('amount-label');
    
            // Thêm nhãn tháng vào thanh
            bar.appendChild(monthLabel);
            // Thêm nhãn doanh thu vào trên cùng cột
            bar.appendChild(amountLabel); // Thêm nhãn doanh thu vào cột
    
            // Đặt vị trí của amountLabel ở trên cùng cột
            amountLabel.style.position = 'absolute'; 
            amountLabel.style.bottom = '100%'; // Đặt ở trên cùng cột
            amountLabel.style.transform = 'translateX(-50%)'; // Căn giữa
    
            // Thêm cột vào biểu đồ
            barChart.appendChild(bar);
        });
    }
    
});
