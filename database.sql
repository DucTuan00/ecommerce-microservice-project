--Database cho user-service
CREATE DATABASE mc_user;
USE mc_user;
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
ALTER TABLE users
ADD email varchar(50);

ALTER TABLE users
ADD birthday date;

--Database cho product-service
CREATE DATABASE mc_product;
USE mc_product;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO categories (name) VALUES ('Chảo');
INSERT INTO categories (name) VALUES ('Nồi');
INSERT INTO categories (name) VALUES ('Máy hút bụi');
INSERT INTO categories (name) VALUES ('Bếp');
INSERT INTO categories (name) VALUES ('Máy xay');

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    category_id INT,
    quantity INT DEFAULT 0,
    active TINYINT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

--Database cho cart-service
CREATE DATABASE mc_cart;
USE mc_cart;
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total_money FLOAT NOT NULL
);

--Database cho order-service
CREATE DATABASE mc_order;
USE mc_order;
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number varchar(10) NOT NULL,
    address varchar(255) NOT NULL, 
    total_amount FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT, 
    product_id INT NOT NULL, 
    quantity INT NOT NULL, 
    price FLOAT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);