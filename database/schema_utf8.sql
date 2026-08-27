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
  `cake_design_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_bookings_cake_design` (`cake_design_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_cake_design` FOREIGN KEY (`cake_design_id`) REFERENCES `cake_designs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_chk_1` CHECK ((`status` in (_utf8mb4'pending',_utf8mb4'approved',_utf8mb4'cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,20,'Test','test@test.com','1234567890','Birthday','2026-09-01','Custom','09:00:00','10:00:00',50,'Grand Ballroom','Gold','[]',275000.00,NULL,'cancelled','2026-08-25 14:07:18','2026-08-25 14:07:18',NULL),(2,20,'vijitha','kusum@gmail.com','0342255762','Wedding','2026-08-28','Custom','10:00:00','11:00:00',50,'Sapphire Hall','Gold','[\"cake\"]',212000.00,NULL,'pending','2026-08-25 15:02:56','2026-08-25 15:02:56',NULL),(3,20,'kusum','kusum@gmail.com','0765467345','Anniversary','2026-09-06','Custom','20:30:00','22:00:00',50,'Grand Ballroom','Platinum','[\"av\"]',350000.00,NULL,'approved','2026-08-25 15:08:22','2026-08-25 15:08:22',NULL),(4,21,'chamodi','chamodiumayangana2001@gmail.com','0740962069','Birthday','2026-08-29','Custom','19:06:00','20:07:00',50,'Grand Ballroom','Gold Package ','[\"cake\"]',287000.00,'\n\n--- Cake Customization ---\nDesign: Design 01\nFlavor: Red Velvet\nIcing: Buttercream\nWeight: 1kg\nShape: Square\nMessage: N/A\nInstructions: N/A','pending','2026-08-26 13:37:43','2026-08-26 13:37:43',NULL),(5,21,'chamodi','chamodiumayangana2001@gmail.com','0740962060','Birthday','2026-08-28','Custom','20:16:00','20:17:00',50,'Sapphire Hall','Gold Package ','[\"cake\"]',212000.00,'\n\n--- Cake Customization ---\nDesign: Design 01\nFlavor: Vanilla\nIcing: Fondant\nWeight: 2kg\nShape: Heart\nMessage: N/A\nInstructions: N/A','pending','2026-08-26 13:47:37','2026-08-26 13:47:37',NULL),(6,21,'chamodi','chamodiumayangana2001@gmail.com','0740962060','Birthday','2026-09-04','Custom','09:00:00','22:00:00',50,'Grand Ballroom','Gold Package ','[\"cake\"]',287000.00,'\n\n--- Cake Details ---\nDesign: Design 01\nWeight: 1.00 kg\nPrice: Rs. 3000.00\nMessage: happy birthday janu\nInstructions: N/A','pending','2026-08-26 15:47:54','2026-08-26 15:47:54',NULL),(7,21,'chamodi','chamodiumayangana2001@gmail.com','0778638094','Birthday','2026-08-29','Custom','19:00:00','21:57:00',50,'Sapphire Hall','Gold Package ','[\"cake\"]',212000.00,'\n\n--- Cake Details ---\nDesign: Design 01\nWeight: 1.5 kg\nPrice: Rs. 3000\nMessage: N/A\nInstructions: N/A','pending','2026-08-26 16:27:47','2026-08-26 16:27:47',NULL),(8,21,'chamodi','chamodiumayangana2001@gmail.com','0778638094','Birthday','2026-09-04','Custom','21:00:00','21:59:00',50,'Sapphire Hall','Gold Package ','[\"cake\"]',212000.00,'\n\n--- Cake Details ---\nDesign: Design 03\nWeight: 1 kg\nPrice: Rs. 2750\nMessage: N/A\nInstructions: N/A','pending','2026-08-26 17:34:23','2026-08-26 17:34:23',NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cake_designs`
--

DROP TABLE IF EXISTS `cake_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cake_designs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `pricing_options` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cake_designs`
--

LOCK TABLES `cake_designs` WRITE;
/*!40000 ALTER TABLE `cake_designs` DISABLE KEYS */;
INSERT INTO `cake_designs` VALUES (4,'Design 01','/uploads/1787761069517-404092503.jpg','active','2026-08-26 16:17:49',NULL,NULL,'[{\"price\": \"2500\", \"weight_kg\": \"1\"}, {\"price\": \"3000\", \"weight_kg\": \"1.5\"}]'),(5,'Design 02','/uploads/1787765433235-715724738.jpg','active','2026-08-26 17:30:33',NULL,NULL,'[{\"price\": \"3000\", \"weight_kg\": \"1\"}, {\"price\": \"3500\", \"weight_kg\": \"1.5\"}]'),(6,'Design 03','/uploads/1787765468836-244142402.jpg','active','2026-08-26 17:31:08',NULL,NULL,'[{\"price\": \"2750\", \"weight_kg\": \"1\"}]'),(7,'Design 04','/uploads/1787765524881-858523646.jpg','active','2026-08-26 17:32:04',NULL,NULL,'[{\"price\": \"3500\", \"weight_kg\": \"1\"}, {\"price\": \"4000\", \"weight_kg\": \"1.5\"}]'),(9,'Design 05','/uploads/1787765719360-217586737.jpg','active','2026-08-26 17:35:19',NULL,NULL,'[{\"price\": \"2400\", \"weight_kg\": \"1\"}]'),(10,'Design 06','/uploads/1787765822203-933049546.jpg','active','2026-08-26 17:37:02',NULL,NULL,'[{\"price\": \"3000\", \"weight_kg\": \"1\"}, {\"price\": \"3500\", \"weight_kg\": \"1.5\"}]'),(11,'Design 07','/uploads/1787765857406-581621087.jpg','active','2026-08-26 17:37:37',NULL,NULL,'[{\"price\": \"3100\", \"weight_kg\": \"1\"}, {\"price\": \"3600\", \"weight_kg\": \"1.5\"}]'),(12,'Design 08','/uploads/1787766287134-587393275.jpg','active','2026-08-26 17:44:47',NULL,NULL,'[{\"price\": \"2700\", \"weight_kg\": \"1\"}, {\"price\": \"3200\", \"weight_kg\": \"2\"}]'),(13,'Design 09','/uploads/1787766322300-925364486.jpg','active','2026-08-26 17:45:22',NULL,NULL,'[{\"price\": \"3500\", \"weight_kg\": \"1\"}, {\"price\": \"4000\", \"weight_kg\": \"1.5\"}]'),(14,'Design 10','/uploads/1787766362171-301166441.jpg','active','2026-08-26 17:46:02',NULL,NULL,'[{\"price\": \"3600\", \"weight_kg\": \"1\"}]'),(15,'Design 11','/uploads/1787766407194-339384909.jpg','active','2026-08-26 17:46:47',NULL,NULL,'[{\"price\": \"3000\", \"weight_kg\": \"1\"}, {\"price\": \"3500\", \"weight_kg\": \"1.5\"}]'),(16,'Design 12','/uploads/1787766447247-229837314.jpg','active','2026-08-26 17:47:27',NULL,NULL,'[{\"price\": \"3200\", \"weight_kg\": \"1\"}, {\"price\": \"4000\", \"weight_kg\": \"2\"}]');
/*!40000 ALTER TABLE `cake_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cake_options`
--

DROP TABLE IF EXISTS `cake_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cake_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` enum('flavor','icing','weight','shape') NOT NULL,
  `value` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cake_options`
--

LOCK TABLES `cake_options` WRITE;
/*!40000 ALTER TABLE `cake_options` DISABLE KEYS */;
INSERT INTO `cake_options` VALUES (1,'flavor','Chocolate','active','2026-08-26 14:04:06'),(2,'flavor','Vanilla','active','2026-08-26 14:04:06'),(3,'flavor','Red Velvet','active','2026-08-26 14:04:06'),(4,'flavor','Ribbon','active','2026-08-26 14:04:06'),(5,'flavor','Butter','active','2026-08-26 14:04:06'),(6,'icing','Buttercream','active','2026-08-26 14:04:06'),(7,'icing','Fondant','active','2026-08-26 14:04:06'),(8,'icing','Chocolate Ganache','active','2026-08-26 14:04:06'),(9,'icing','Fresh Cream','active','2026-08-26 14:04:06'),(10,'weight','1kg','active','2026-08-26 14:04:06'),(11,'weight','1.5kg','active','2026-08-26 14:04:06'),(12,'weight','2kg','active','2026-08-26 14:04:06'),(13,'weight','3kg','active','2026-08-26 14:04:06'),(14,'weight','5kg','active','2026-08-26 14:04:06'),(15,'shape','Round','active','2026-08-26 14:04:06'),(16,'shape','Square','active','2026-08-26 14:04:06'),(17,'shape','Heart','active','2026-08-26 14:04:06');
/*!40000 ALTER TABLE `cake_options` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catering_packages`
--

LOCK TABLES `catering_packages` WRITE;
/*!40000 ALTER TABLE `catering_packages` DISABLE KEYS */;
INSERT INTO `catering_packages` VALUES (1,'Gold Package ',2500.00,'Standard Buffet + Welcome Drink','[\"Welcome Drink(Fruit Juice)\", \"Chicken Fried Rice\", \"Kankun Devilled\", \"Vegetable Chopsuey\", \"2 Cutlet\"]','2026-07-05 05:34:06','active'),(2,'Diamond Package',4500.00,'Grand Buffet + Welcome Drink + 2 Desserts','[\"Welcome Drink (Mango / Faluda) \", \"Basmati Chicken Fried Rice\", \"Seafood Noodles\", \"Devilled Chicken or Mutton Curry\", \"Crumb Fried Prawns\", \"Cashew & Green Pea Curry\", \"Watalappam & Caramel Pudding\"]','2026-08-26 18:10:55','active'),(3,'Platinum Package',3500.00,'Welcome Drink (Mixed Fruit Juice)','[\"Chicken Fried Rice / Yellow Rice\", \"Sweet & Sour Fish\", \"Hot Butter Cuttlefish\", \"Brinjal Moju\", \"Potato Tempered\", \"Watalappam / Ice Cream\"]','2026-08-26 18:13:59','active');
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
-- Table structure for table `daily_forecasts`
--

DROP TABLE IF EXISTS `daily_forecasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_forecasts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `forecast_date` date NOT NULL,
  `source` varchar(20) DEFAULT 'heuristic',
  `payload` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `forecast_date` (`forecast_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_forecasts`
--

LOCK TABLES `daily_forecasts` WRITE;
/*!40000 ALTER TABLE `daily_forecasts` DISABLE KEYS */;
INSERT INTO `daily_forecasts` VALUES (1,'2026-08-27','heuristic','{\"topItems\": [{\"icon\": \"🍞\", \"name\": \"Vegetable Soup\", \"price\": 400, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"General\", \"recommendedStock\": 1}, {\"icon\": \"🍞\", \"name\": \"Chicken With Egg Soup\", \"price\": 450, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"General\", \"recommendedStock\": 1}, {\"icon\": \"🍞\", \"name\": \"Vegetable Noodles\", \"price\": 600, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"General\", \"recommendedStock\": 1}, {\"icon\": \"🍞\", \"name\": \"vegitable fride rice\", \"price\": 0, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"Fried Rice\", \"recommendedStock\": 1}, {\"icon\": \"🍞\", \"name\": \"HOT & SOUR CHICKEN SOUP\", \"price\": 500, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"Soups\", \"recommendedStock\": 1}, {\"icon\": \"🍞\", \"name\": \"TOM YAM SEAFOOD SOUP\", \"price\": 550, \"change\": \"+0.0%\", \"demand\": \"1 units/day\", \"category\": \"Soups\", \"recommendedStock\": 1}], \"heatmapData\": [[1, 2, 2, 2, 2, 2, 1], [4, 3, 2, 1, 5, 4, 4], [5, 1, 4, 5, 4, 5, 5], [3, 5, 4, 3, 3, 3, 3]], \"itemsGrowth\": \"+0.0%\", \"salesGrowth\": \"+0.0%\", \"categoryData\": [{\"name\": \"Menu\", \"color\": \"#2E1A12\", \"value\": 5}, {\"name\": \"Fried Rice\", \"color\": \"#C8843B\", \"value\": 2}, {\"name\": \"Cold Beverages\", \"color\": \"#D4BFA0\", \"value\": 1}, {\"name\": \"Fresh Juice\", \"color\": \"#E8DCC8\", \"value\": 1}], \"forecastData\": [{\"name\": \"Fri\\nAug 28\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Sat\\nAug 29\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Sun\\nAug 30\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Mon\\nAug 31\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Tue\\nSep 1\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Wed\\nSep 2\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}, {\"name\": \"Thu\\nSep 3\", \"actual\": null, \"forecast\": 4690, \"confidence\": [3987, 5394]}], \"ordersGrowth\": \"+0.0%\", \"peakHourData\": [{\"time\": \"08:00\", \"demand\": 0}, {\"time\": \"10:00\", \"demand\": 0}, {\"time\": \"12:00\", \"demand\": 4}, {\"time\": \"14:00\", \"demand\": 0}, {\"time\": \"16:00\", \"demand\": 0}, {\"time\": \"18:00\", \"demand\": 0}, {\"time\": \"20:00\", \"demand\": 0}, {\"time\": \"22:00\", \"demand\": 0}], \"forecastedOrders\": 9, \"aiRecommendations\": [{\"type\": \"stock\", \"title\": \"Restock top category: Menu\", \"description\": \"This category has the highest recent order volume.\"}], \"highDemandItemsCount\": 1, \"totalForecastedSales\": 4690, \"expectedRevenueIncrease\": \"Rs. 0 (heuristic baseline, no growth data yet)\", \"predictedProductionQuantity\": 9}','2026-08-27 02:57:40');
/*!40000 ALTER TABLE `daily_forecasts` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
INSERT INTO `dishes` VALUES (1,NULL,'A La Carte','WBD0001','Vegetable Soup','regular',400.00,0.00,0.00,'2026-07-04 18:35:04','2026-07-04 18:35:04','active',1,0.00),(2,NULL,'A La Carte','WBD0002','Chicken With Egg Soup','regular',450.00,0.00,0.00,'2026-07-04 20:25:52','2026-07-04 20:25:52','active',1,0.00),(3,NULL,'A La Carte','WBD0003','Vegetable Noodles','portions',600.00,650.00,950.00,'2026-07-04 20:56:18','2026-07-04 20:56:18','active',1,0.00),(10,4,'A La Carte','WBD0004','vegitable fride rice','varied',0.00,650.00,950.00,'2026-08-25 13:16:00','2026-08-25 13:16:00','active',1,10.00),(11,2,'A La Carte','WBD0005','HOT & SOUR CHICKEN SOUP','regular',500.00,0.00,0.00,'2026-08-26 17:52:27','2026-08-26 17:52:27','active',1,0.00),(12,2,'A La Carte','WBD0006','TOM YAM SEAFOOD SOUP','regular',550.00,0.00,0.00,'2026-08-26 17:53:11','2026-08-26 17:53:11','active',1,0.00),(13,2,'A La Carte','WBD0007','CREAM OF MUSHROOM SOUP','regular',850.00,0.00,0.00,'2026-08-26 17:53:59','2026-08-26 17:53:59','active',1,0.00),(14,3,'A La Carte','WBD0008','COLESLAW SALAD','regular',750.00,0.00,0.00,'2026-08-26 17:54:23','2026-08-26 17:54:23','active',1,0.00),(15,3,'A La Carte','WBD0009','TOMATO ONION SALAD','regular',850.00,0.00,0.00,'2026-08-26 17:55:00','2026-08-26 17:55:00','active',1,0.00),(16,3,'A La Carte','WBD0010','FISH SALAD','regular',850.00,0.00,0.00,'2026-08-26 17:56:15','2026-08-26 17:56:15','active',1,0.00),(17,3,'A La Carte','WBD0011','MIXED VEGETABLE SALAD','regular',750.00,0.00,0.00,'2026-08-26 17:56:41','2026-08-26 17:56:41','active',1,0.00),(18,4,'A La Carte','WBD0012','VEGETABLE FRIED RICE','varied',0.00,650.00,950.00,'2026-08-26 17:57:37','2026-08-26 17:57:37','active',1,0.00),(19,4,'A La Carte','WBD0013','EGG FRIED RICE ','varied',0.00,700.00,1100.00,'2026-08-26 17:58:07','2026-08-26 17:58:07','active',1,0.00),(20,4,'A La Carte','WBD0014','CHICKEN FRIED RICE','varied',0.00,800.00,1300.00,'2026-08-26 17:58:50','2026-08-26 17:58:50','active',1,0.00),(21,4,'A La Carte','WBD0015','SEAFOOD FRIED RICE','varied',0.00,1000.00,1500.00,'2026-08-26 18:00:19','2026-08-26 18:00:19','active',1,0.00),(22,4,'A La Carte','WBD0016','MIXED FRIED RICE','varied',0.00,1100.00,1700.00,'2026-08-26 18:00:49','2026-08-26 18:00:49','active',1,0.00),(23,4,'A La Carte','WBD0017','NASIGURAN MIXED RICE ','varied',0.00,1200.00,1800.00,'2026-08-26 18:01:20','2026-08-26 18:01:20','active',1,0.00),(24,4,'A La Carte','WBD0018','MONGOLIAN SEAFOOD RICE','varied',0.00,1100.00,1600.00,'2026-08-26 18:02:00','2026-08-26 18:02:00','active',1,0.00),(25,4,'A La Carte','WBD0019','BACON & EGG FRIED RICE ','varied',0.00,1300.00,2000.00,'2026-08-26 18:02:45','2026-08-26 18:02:45','active',1,0.00),(26,4,'A La Carte','WBD0020','WIJAYASIRI SPECIAL CHICKEN KEBAB RICE','regular',2700.00,0.00,0.00,'2026-08-26 18:03:11','2026-08-26 18:03:11','active',1,0.00),(27,4,'A La Carte','WBD0021','WIJAYASIRI SPECIAL JAMBO NASI ','regular',3700.00,0.00,0.00,'2026-08-26 18:03:36','2026-08-26 18:03:36','active',1,0.00);
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
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notif_user` (`user_id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'New Order #4','A customer has placed a new takeaway order for Rs. 600.00.','order',1,'2026-08-25 12:32:26',NULL),(2,'Order #4 Updated','Customer appended new items for Rs. 1270.00.','order',1,'2026-08-25 12:33:21',NULL),(3,'New Order #5','A customer has placed a new takeaway order for Rs. 600.00.','order',1,'2026-08-25 15:35:02',NULL),(4,'New Order #6','A customer has placed a new takeaway order for Rs. 585.00.','order',1,'2026-08-25 15:42:03',NULL),(5,'New Order #7','A customer has placed a new takeaway order for Rs. 585.00.','order',1,'2026-08-25 15:50:54',NULL),(6,'Order #7 Updated','Customer appended new items for Rs. 600.00.','order',1,'2026-08-25 15:54:51',NULL),(7,'New Order #8','A customer has placed a new takeaway order for Rs. 450.00.','order',1,'2026-08-25 15:59:09',NULL),(8,'Order #8 Accepted','Your order has been accepted and will be ready in approximately 1h 30m.','order',0,'2026-08-25 15:59:41',21);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,4,NULL,3,1,600.00,'2026-08-25 12:32:26',NULL,'Vegetable Noodles'),(2,4,NULL,3,1,600.00,'2026-08-25 12:33:21',NULL,'Vegetable Noodles'),(3,4,NULL,NULL,1,500.00,'2026-08-25 12:33:21',6,'Papaya Juice'),(4,4,NULL,NULL,1,170.00,'2026-08-25 12:33:21',5,'Pepsi (250ml)'),(5,5,NULL,3,1,600.00,'2026-08-25 15:35:02',NULL,'Vegetable Noodles'),(6,6,NULL,10,1,585.00,'2026-08-25 15:42:03',NULL,'vegitable fride rice (Small)'),(7,7,NULL,10,1,585.00,'2026-08-25 15:50:54',NULL,'vegitable fride rice (Small)'),(8,7,NULL,3,1,600.00,'2026-08-25 15:54:51',NULL,'Vegetable Noodles'),(9,8,NULL,2,1,450.00,'2026-08-25 15:59:09',NULL,'Chicken With Egg Soup');
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
  `prep_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_chk_1` CHECK ((`order_type` in (_utf8mb4'dine-in',_utf8mb4'takeaway'))),
  CONSTRAINT `orders_chk_2` CHECK ((`status` in (_utf8mb4'pending',_utf8mb4'accepted',_utf8mb4'preparing',_utf8mb4'ready',_utf8mb4'completed',_utf8mb4'cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,21,1200.00,'takeaway',NULL,'pending','2026-08-25 12:28:27','2026-08-25 12:28:27',NULL,NULL),(2,21,1200.00,'takeaway',NULL,'pending','2026-08-25 12:28:32','2026-08-25 12:28:32',NULL,NULL),(3,21,600.00,'takeaway',NULL,'pending','2026-08-25 12:29:22','2026-08-25 12:29:22',NULL,NULL),(4,21,1870.00,'takeaway',NULL,'accepted','2026-08-25 12:32:26','2026-08-25 12:32:26',NULL,NULL),(5,21,600.00,'takeaway',NULL,'accepted','2026-08-25 15:35:02','2026-08-25 15:35:02',NULL,1),(6,21,585.00,'takeaway',NULL,'pending','2026-08-25 15:42:03','2026-08-25 15:42:03',NULL,NULL),(7,21,1185.00,'takeaway',NULL,'pending','2026-08-25 15:50:54','2026-08-25 15:50:54',NULL,NULL),(8,21,450.00,'takeaway',NULL,'accepted','2026-08-25 15:59:09','2026-08-25 15:59:09',NULL,90);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premium_addons`
--

DROP TABLE IF EXISTS `premium_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_addons` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_addons`
--

LOCK TABLES `premium_addons` WRITE;
/*!40000 ALTER TABLE `premium_addons` DISABLE KEYS */;
INSERT INTO `premium_addons` VALUES ('bbq','Live BBQ Station',15000.00,'active','2026-08-25 17:54:32'),('cake','Cake',12000.00,'active','2026-08-26 13:21:48'),('hoppers','Live Hoppers Station',10000.00,'active','2026-08-25 17:54:32'),('kottu','Live Kottu Station',12000.00,'active','2026-08-25 17:54:32');
/*!40000 ALTER TABLE `premium_addons` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (20,'nimmani','kaveeshanimmani2@gmail.com','$2b$10$nJT5D5c.cV8ALNn6P5v9f.TdToLQfY.mMyMLJ/60LE/iX.NTVczlS','admin','active',NULL,NULL,NULL,'2026-08-25 12:20:07','2026-08-25 12:20:07'),(21,'chamodi','chamodiumayangana2001@gmail.com','$2b$10$6yO98fYiixwRhnMXIhaOvO0KM.BO2a1ih9L0wahMT.YLm8PUa4NaW','customer','active',NULL,NULL,NULL,'2026-08-25 12:23:12','2026-08-25 12:23:12'),(22,'lahiru','lahiru@gmail.com','$2b$10$hAjefAL8tizqr0wLz1vggePt6Ozh/D2inZsOlMFEoiZRo8.8yDN0W','customer','active',NULL,NULL,NULL,'2026-08-25 16:14:26','2026-08-25 16:14:26');
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

-- Dump completed on 2026-08-27  3:06:49
