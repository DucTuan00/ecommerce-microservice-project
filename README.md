Chạy file database.sql trong mysql workbench

Tạo 2 bản ghi trong bảng roles: (id: 1, name: admin), (id: 2, name: user)

Ở thư mục to nhất, cd vào từng thư mục api-gateway, auth-service, cart-service, order-service, product-service, user-service, zalopay-service

Sau khi cd vào thì gõ npm install để cài đầy đủ node_modules cho từng service, khi cài xong cho 1 service thì cd .. để ra thư mục to nhất và cd lại từng service rồi lặp lại npm install

Khi cài đầy đủ node_modules thì cd .. ra thư mục to nhất và nhập npm run start-all để chạy backend, vào file home.html trong thư mục client để chạy frontend web bằng extension live server, bên phía mobile app thì chỉ cần ấn chạy chương trình và sử dụng