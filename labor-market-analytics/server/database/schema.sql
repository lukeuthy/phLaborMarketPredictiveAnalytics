-- Create database
CREATE DATABASE IF NOT EXISTS labor_analytics;
USE labor_analytics;

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(255),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  record_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_upload_date (upload_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Labor data table
CREATE TABLE IF NOT EXISTS labor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  quarter INT NOT NULL,
  year INT NOT NULL,
  lfpr DECIMAL(10, 4),
  employment_rate DECIMAL(10, 4),
  unemployment_rate DECIMAL(10, 4),
  underemployment_rate DECIMAL(10, 4),
  sector VARCHAR(100) DEFAULT 'Overall',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_year_quarter (year, quarter),
  INDEX idx_sector (sector),
  UNIQUE KEY unique_record (dataset_id, year, quarter, sector)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Processing results table
CREATE TABLE IF NOT EXISTS processing_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  algorithms JSON NOT NULL,
  results JSON NOT NULL,
  processing_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preprocessing logs table
CREATE TABLE IF NOT EXISTS preprocessing_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  step VARCHAR(100),
  status ENUM('pending', 'in_progress', 'completed', 'failed'),
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  metric_type VARCHAR(100),
  metric_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create triggers to update record count
DELIMITER $$

CREATE TRIGGER update_dataset_count_insert
AFTER INSERT ON labor_data
FOR EACH ROW
BEGIN
  UPDATE datasets SET record_count = record_count + 1 WHERE id = NEW.dataset_id;
END$$

CREATE TRIGGER update_dataset_count_delete
AFTER DELETE ON labor_data
FOR EACH ROW
BEGIN
  UPDATE datasets SET record_count = record_count - 1 WHERE id = OLD.dataset_id;
END$$

DELIMITER ;
