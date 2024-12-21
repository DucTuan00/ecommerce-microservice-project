document.addEventListener("DOMContentLoaded", () => {
    fetch("../footer/footer.html") // Đường dẫn đến file footer.html
        .then(response => {
            if (!response.ok) {
                throw new Error("Lỗi khi tải footer");
            }
            return response.text();
        })
        .then(data => {
            // Chèn nội dung footer vào container
            document.getElementById("footer-container").innerHTML = data;
        })
        .catch(error => {
            console.error("Lỗi khi load footer:", error);
        });
});