-- phpMyAdmin SQL Dump
-- version 5.2.0
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2026

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopwithme_db`
--
CREATE DATABASE IF NOT EXISTS `shopwithme_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `shopwithme_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `createdAt`) VALUES
('admin-001', 'Admin', 'admin@example.com', 'admin123', 'admin', '2026-03-29 10:00:00'),
('usr-1', 'Raj Kumar', 'raj@example.com', 'password123', 'user', '2026-03-29 10:05:00'),
('usr-2', 'Priya Singh', 'priya@example.com', 'testpass456', 'user', '2026-03-29 10:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `rating` decimal(3,1) NOT NULL DEFAULT 0.0,
  `reviews` int(11) NOT NULL DEFAULT 0,
  `isFeatured` boolean NOT NULL DEFAULT FALSE,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `image`, `category`, `badge`, `rating`, `reviews`, `isFeatured`, `createdAt`) VALUES
('prd-1', 'Premium Wireless Headphones', 12999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', 'Electronics', 'Best Seller', 4.5, 128, 1, '2026-03-29 11:00:00'),
('prd-2', 'Smart Fitness Watch', 7499.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', 'Electronics', 'New', 4.8, 85, 1, '2026-03-29 11:30:00'),
('prd-3', 'Ergonomic Office Chair', 15999.00, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800', 'Home Office', '', 4.2, 56, 0, '2026-03-29 11:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `shippingAddress` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `userId`, `totalAmount`, `status`, `items`, `shippingAddress`, `date`) VALUES
('ord-9012', 'usr-1', 12999.00, 'Delivered', '[{\"productId\":\"prd-1\",\"quantity\":1,\"price\":12999.00}]', '123 Main Street, Mumbai, Maharashtra 400001', '2026-03-28 14:20:00');

-- --------------------------------------------------------

--
-- Indexes for dumped tables
--

-- Indexes for table `users`
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

-- Indexes for table `products`
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

-- Indexes for table `orders`
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

-- Constraints for table `orders`
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;

-- -----------------------------------------------------------------------------------------
-- =========================================================================================
-- ALL SHOPWITHME APPLICATION QUERIES (CRUD OPERATIONS & ANALYTICS)
-- =========================================================================================
-- -----------------------------------------------------------------------------------------

/*
  These queries perfectly replicate the logic used in our `js/db.js` Local Storage 
  database, translated into standard MySQL syntax for backend reference.
*/

-- 1. USER AUTHENTICATION & MANAGEMENT
-- ------------------------------------------------

-- Register a new user
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`) 
VALUES ('usr-5432', 'Amit Sharma', 'amit@example.com', 'securepass123', 'user');

-- Login check (Validate user credentials)
SELECT `id`, `username`, `email`, `role` 
FROM `users` 
WHERE `email` = 'amit@example.com' AND `password` = 'securepass123';

-- Fetch user profile details
SELECT * FROM `users` WHERE `id` = 'usr-1';


-- 2. PRODUCT CATALOG & BROWSING (PRODUCTS TAB)
-- ------------------------------------------------

-- Get all products (Used for main products page)
SELECT * FROM `products` ORDER BY `createdAt` DESC;

-- Get only "Featured" products (Used for homepage section)
SELECT * FROM `products` WHERE `isFeatured` = 1 ORDER BY `rating` DESC LIMIT 8;

-- Get products by specific Category (Filter on products page)
SELECT * FROM `products` WHERE `category` = 'Electronics';

-- Search products by Name (Search bar functionality)
SELECT * FROM `products` WHERE `name` LIKE '%Watch%';

-- Get single product details (Used when clicking a product to view details)
SELECT * FROM `products` WHERE `id` = 'prd-2';


-- 3. ADMIN PRODUCT MANAGEMENT
-- ------------------------------------------------

-- Add a new product to inventory (Admin Dashboard)
INSERT INTO `products` (`id`, `name`, `price`, `image`, `category`, `badge`, `isFeatured`) 
VALUES ('prd-100', 'Gaming Mechanical Keyboard', 4599.00, 'https://...', 'Electronics', 'New', 0);

-- Update an existing product (Edit button clicked by Admin)
UPDATE `products` 
SET `name` = 'Gaming Mechanical Keyboard Pro', `price` = 4999.00, `isFeatured` = 1 
WHERE `id` = 'prd-100';

-- Toggle 'Feature on Home Screen' flag only
UPDATE `products` SET `isFeatured` = 1 WHERE `id` = 'prd-3';

-- Delete a product (Trash icon clicked by Admin)
DELETE FROM `products` WHERE `id` = 'prd-100';


-- 4. ORDER MANAGEMENT & CART CHECKOUT
-- ------------------------------------------------

-- Place a new order (Checkout Flow)
-- The `items` column uses JSON data type to store the cart array dynamically
INSERT INTO `orders` (`id`, `userId`, `totalAmount`, `status`, `shippingAddress`, `items`) 
VALUES ('ord-new99', 'usr-1', 4599.00, 'Pending', '456 MG Road, Delhi 110001', '[{"productId": "prd-100", "quantity": 1, "price": 4599.00}]');

-- View Order History for a specific User (Used on orders.html profile page)
SELECT `id`, `totalAmount`, `status`, `date` 
FROM `orders` 
WHERE `userId` = 'usr-1' 
ORDER BY `date` DESC;

-- Get detailed order with User Information (JOIN query)
SELECT o.id as OrderID, u.username as Customer, o.totalAmount, o.status, o.shippingAddress, o.date 
FROM `orders` o 
INNER JOIN `users` u ON o.userId = u.id 
WHERE o.id = 'ord-9012';

-- Admin updating the order status (e.g. Pending -> Shipped)
UPDATE `orders` SET `status` = 'Shipped' WHERE `id` = 'ord-9012';


-- 5. ADMIN DASHBOARD ANALYTICS & STATS
-- ------------------------------------------------

-- Get Executive Overview: Total Users
SELECT COUNT(*) as `TotalUsers` FROM `users` WHERE `role` = 'user';

-- Get Executive Overview: Total Orders Count
SELECT COUNT(*) as `TotalOrders` FROM `orders`;

-- Get Executive Overview: Total Revenue Generated (All non-cancelled orders)
SELECT SUM(`totalAmount`) as `TotalRevenue` FROM `orders` WHERE `status` != 'Cancelled';

-- Get Recent Orders for Dashboard Table (Latest 5 orders)
SELECT o.id, u.id as UserID, o.totalAmount, o.status 
FROM `orders` o 
JOIN `users` u ON o.userId = u.id 
ORDER BY o.date DESC 
LIMIT 5;

-- Analytics: Revenue by Category
-- (This requires joining JSON items, but conceptually the logical query looks like this:)
/*
SELECT p.category, SUM(JSON_EXTRACT(o.items, '$[*].price')) as CategoryRevenue
FROM orders o, JSON_TABLE(o.items, '$[*]' COLUMNS (productId VARCHAR(255) PATH '$.productId')) items
JOIN products p ON items.productId = p.id
GROUP BY p.category;
*/

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
