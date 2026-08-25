-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: smart_bake_hub
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `beverage_categories`
--

DROP TABLE IF EXISTS `beverage_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beverage_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beverage_categories`
--

LOCK TABLES `beverage_categories` WRITE;
/*!40000 ALTER TABLE `beverage_categories` DISABLE KEYS */;
INSERT INTO `beverage_categories` VALUES (5,'Hot Beverages','No Description','2026-07-05 00:52:51'),(6,'Cold Beverages','No Description','2026-07-05 00:53:27'),(7,'Fresh Juice','No desc.','2026-07-05 03:28:10');
/*!40000 ALTER TABLE `beverage_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beverages`
--

DROP TABLE IF EXISTS `beverages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beverages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `beverage_category_id` int DEFAULT NULL,
  `beverage_code` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `portion_type` varchar(20) DEFAULT 'regular',
  `price` decimal(10,2) DEFAULT NULL,
  `price_small` decimal(10,2) DEFAULT NULL,
  `price_large` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'active',
  `is_available` tinyint(1) DEFAULT '1',
  `price_variants` json DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_bev_cat` (`beverage_category_id`),
  CONSTRAINT `fk_bev_cat` FOREIGN KEY (`beverage_category_id`) REFERENCES `beverage_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beverages`
--

LOCK TABLES `beverages` WRITE;
/*!40000 ALTER TABLE `beverages` DISABLE KEYS */;
INSERT INTO `beverages` VALUES (2,5,'WBB0001','Nestea','regular',120.00,0.00,0.00,'2026-07-05 00:53:01','2026-07-05 00:53:01','active',1,NULL,0.00),(3,6,'WBB0002','Coca Cola','bottles',0.00,0.00,0.00,'2026-07-05 00:53:48','2026-07-05 00:53:48','active',1,'[{\"size\": \"250 ML\", \"price\": 130}]',0.00),(4,6,'WBB0003','Coca Cola','bottles',0.00,0.00,0.00,'2026-07-05 00:54:15','2026-07-05 00:54:15','active',1,'[{\"size\": \"500ML\", \"price\": 250}]',0.00),(5,6,'WBB0004','Pepsi','bottles',0.00,0.00,0.00,'2026-07-05 03:52:34','2026-07-05 03:52:34','active',1,'[{\"size\": \"250ml\", \"price\": 170}]',0.00),(6,7,'WBB0005','Papaya Juice','regular',500.00,0.00,0.00,'2026-07-05 03:59:12','2026-07-05 03:59:12','active',1,NULL,0.00);
/*!40000 ALTER TABLE `beverages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `event_session` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `guest_count` int NOT NULL,
  `hall_name` varchar(155) NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `add_ons` text,
  `total_price` decimal(10,2) NOT NULL,
  `special_notes` text,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_chk_1` CHECK ((`status` in (_latin1'pending',_latin1'approved',_latin1'cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,20,'Test','test@test.com','1234567890','Birthday','2026-09-01','Custom','09:00:00','10:00:00',50,'Grand Ballroom','Gold','[]',275000.00,NULL,'pending','2026-08-25 14:07:18','2026-08-25 14:07:18'),(2,20,'vijitha','kusum@gmail.com','0342255762','Wedding','2026-08-28','Custom','10:00:00','11:00:00',50,'Sapphire Hall','Gold','[\"cake\"]',212000.00,NULL,'pending','2026-08-25 15:02:56','2026-08-25 15:02:56'),(3,20,'kusum','kusum@gmail.com','0765467345','Anniversary','2026-09-06','Custom','20:30:00','22:00:00',50,'Grand Ballroom','Platinum','[\"av\"]',350000.00,NULL,'pending','2026-08-25 15:08:22','2026-08-25 15:08:22');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catering_packages`
--

DROP TABLE IF EXISTS `catering_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catering_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `items` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catering_packages`
--

LOCK TABLES `catering_packages` WRITE;
/*!40000 ALTER TABLE `catering_packages` DISABLE KEYS */;
INSERT INTO `catering_packages` VALUES (1,'Gold Package ',2500.00,'Standard Buffet + Welcome Drink','[\"Welcome Drink(Fruit Juice)\", \"Chicken Fried Rice\", \"Kankun Devilled\", \"Vegetable Chopsuey\", \"2 Cutlet\"]','2026-07-05 05:34:06','active');
/*!40000 ALTER TABLE `catering_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `sender` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,'session_jq2i1uzo7','bot','Hello! Welcome to Smart Bake Hub. How can I help you today?','2026-08-25 13:24:08'),(2,'session_jq2i1uzo7','bot','Please wait, an admin will be with you shortly.','2026-08-25 13:24:09'),(3,'session_jq2i1uzo7','customer','hy','2026-08-25 13:24:15'),(4,'session_jq2i1uzo7','admin','hy','2026-08-25 13:24:35');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `session_id` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT 'Guest',
  `status` varchar(50) DEFAULT 'bot',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
INSERT INTO `chat_sessions` VALUES ('session_jq2i1uzo7',21,'chamodi','admin_active','2026-08-25 13:24:08','2026-08-25 13:24:35');
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dish_categories`
--

DROP TABLE IF EXISTS `dish_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dish_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dish_categories`
--

LOCK TABLES `dish_categories` WRITE;
/*!40000 ALTER TABLE `dish_categories` DISABLE KEYS */;
INSERT INTO `dish_categories` VALUES (1,'All','Filter All','2026-08-25 13:14:44'),(2,'Soups','Soups','2026-08-25 13:14:44'),(3,'Salads','Salads','2026-08-25 13:14:44'),(4,'Fried Rice','Fried Rice','2026-08-25 13:14:44'),(5,'Noodles','Noodles','2026-08-25 13:14:44'),(6,'Chop Suey','Chop Suey','2026-08-25 13:14:44'),(7,'Kottu','Kottu','2026-08-25 13:14:44'),(8,'String Hopper Kottu','String Hopper Kottu','2026-08-25 13:14:44'),(9,'Pasta & Spaghetti','Pasta & Spaghetti','2026-08-25 13:14:44'),(10,'Vegetable Dishes','Vegetable Dishes','2026-08-25 13:14:44'),(11,'Egg Dishes','Egg Dishes','2026-08-25 13:14:44'),(12,'Meat Dishes','Meat Dishes','2026-08-25 13:14:44'),(13,'Seafood Dishes','Seafood Dishes','2026-08-25 13:14:44');
/*!40000 ALTER TABLE `dish_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dishes`
--

DROP TABLE IF EXISTS `dishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `menu_category` varchar(100) DEFAULT NULL,
  `dish_code` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `portion_type` varchar(20) DEFAULT 'regular',
  `price` decimal(10,2) DEFAULT NULL,
  `price_small` decimal(10,2) DEFAULT NULL,
  `price_large` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'active',
  `is_available` tinyint(1) DEFAULT '1',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `dishes_ibfk_1` (`category_id`),
  CONSTRAINT `dishes_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `dish_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
INSERT INTO `dishes` VALUES (1,NULL,'A La Carte','WBD0001','Vegetable Soup','regular',400.00,0.00,0.00,'2026-07-04 18:35:04','2026-07-04 18:35:04','active',1,0.00),(2,NULL,'A La Carte','WBD0002','Chicken With Egg Soup','regular',450.00,0.00,0.00,'2026-07-04 20:25:52','2026-07-04 20:25:52','active',1,0.00),(3,NULL,'A La Carte','WBD0003','Vegetable Noodles','portions',600.00,650.00,950.00,'2026-07-04 20:56:18','2026-07-04 20:56:18','active',1,0.00),(10,4,'A La Carte','WBD0004','vegitable fride rice','varied',0.00,650.00,950.00,'2026-08-25 13:16:00','2026-08-25 13:16:00','active',1,10.00);
/*!40000 ALTER TABLE `dishes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'New Order #4','A customer has placed a new takeaway order for Rs. 600.00.','order',1,'2026-08-25 12:32:26'),(2,'Order #4 Updated','Customer appended new items for Rs. 1270.00.','order',1,'2026-08-25 12:33:21');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `menu_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `beverage_id` int DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`menu_id`) REFERENCES `dishes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,4,NULL,3,1,600.00,'2026-08-25 12:32:26',NULL,'Vegetable Noodles'),(2,4,NULL,3,1,600.00,'2026-08-25 12:33:21',NULL,'Vegetable Noodles'),(3,4,NULL,NULL,1,500.00,'2026-08-25 12:33:21',6,'Papaya Juice'),(4,4,NULL,NULL,1,170.00,'2026-08-25 12:33:21',5,'Pepsi (250ml)');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `order_type` varchar(50) DEFAULT 'dine-in',
  `table_number` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `special_note` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_chk_1` CHECK ((`order_type` in (_utf8mb4'dine-in',_utf8mb4'takeaway'))),
  CONSTRAINT `orders_chk_2` CHECK ((`status` in (_utf8mb4'pending',_utf8mb4'accepted',_utf8mb4'preparing',_utf8mb4'ready',_utf8mb4'completed',_utf8mb4'cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,21,1200.00,'takeaway',NULL,'pending','2026-08-25 12:28:27','2026-08-25 12:28:27',NULL),(2,21,1200.00,'takeaway',NULL,'pending','2026-08-25 12:28:32','2026-08-25 12:28:32',NULL),(3,21,600.00,'takeaway',NULL,'pending','2026-08-25 12:29:22','2026-08-25 12:29:22',NULL),(4,21,1870.00,'takeaway',NULL,'accepted','2026-08-25 12:32:26','2026-08-25 12:32:26',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Bakery Products','Freshly baked breads and buns','2026-07-04 10:26:10'),(2,'Meals','Delicious breakfast, lunch, and dinner meals','2026-07-04 10:26:10'),(3,'Beverages','Hot and cold drinks','2026-07-04 10:26:10'),(4,'Cakes','Custom and ready-made cakes for all occasions','2026-07-04 10:26:10'),(6,'Soups','Various soup dishes','2026-07-04 18:31:59'),(7,'Noodles','Gently cooked noodle ','2026-07-04 20:55:53'),(8,'Cold Beverages','Cold fresh & Taste Coke','2026-07-05 00:35:57');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `availability` varchar(50) DEFAULT 'available',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `expiry_date` date DEFAULT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_chk_1` CHECK ((`availability` in (_latin1'available',_latin1'out_of_stock')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'customer',
  `status` varchar(50) DEFAULT 'pending_verification',
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`role` in (_latin1'admin',_latin1'staff',_latin1'customer'))),
  CONSTRAINT `users_chk_2` CHECK ((`status` in (_latin1'active',_latin1'inactive',_latin1'pending_verification')))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (20,'nimmani','kaveeshanimmani2@gmail.com','$2b$10$nJT5D5c.cV8ALNn6P5v9f.TdToLQfY.mMyMLJ/60LE/iX.NTVczlS','admin','active',NULL,NULL,NULL,'2026-08-25 12:20:07','2026-08-25 12:20:07'),(21,'chamodi','chamodiumayangana2001@gmail.com','$2b$10$6yO98fYiixwRhnMXIhaOvO0KM.BO2a1ih9L0wahMT.YLm8PUa4NaW','customer','active',NULL,NULL,NULL,'2026-08-25 12:23:12','2026-08-25 12:23:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-25 15:13:50
