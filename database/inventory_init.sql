CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `stock_quantity` decimal(10,2) DEFAULT '0.00',
  `low_stock_threshold` decimal(10,2) DEFAULT '10.00',
  `expiry_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `remarks` text,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory_items` (`item_name`, `category`, `sku`, `stock_quantity`, `low_stock_threshold`, `expiry_date`) VALUES
('Flour 5kg', 'raw_materials', 'RM001', 50, 10, '2026-12-31'),
('Sugar 1kg', 'raw_materials', 'RM002', 5, 20, '2027-01-15'),
('Butter', 'raw_materials', 'RM003', 2, 5, '2026-09-05'),
('Chocolate Chips', 'raw_materials', 'RM004', 15, 5, '2026-11-20');
