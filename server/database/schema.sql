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

-- Updated labor_data table to use monthly data instead of quarterly
-- Labor data table (Monthly granularity)
CREATE TABLE IF NOT EXISTS labor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  region VARCHAR(100) DEFAULT 'National',
  industry VARCHAR(100) DEFAULT 'Overall',
  employment_rate DECIMAL(10, 4),
  unemployment_rate DECIMAL(10, 4),
  underemployment_rate DECIMAL(10, 4),
  labor_force_participation_rate DECIMAL(10, 4),
  average_wage_php DECIMAL(12, 2),
  gdp_growth_rate DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_year_month (year, month),
  INDEX idx_region (region),
  INDEX idx_industry (industry),
  UNIQUE KEY unique_record (dataset_id, year, month, region, industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Processing results table
CREATE TABLE IF NOT EXISTS processing_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  algorithms JSON NOT NULL,
  results JSON NOT NULL,
  metrics JSON NOT NULL,
  best_algorithm VARCHAR(100),
  fastest_algorithm VARCHAR(100),
  processing_time INT,
  data_points INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics cache table (for storing prediction results)
CREATE TABLE IF NOT EXISTS prediction_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  metric_type VARCHAR(100),
  forecast_data JSON NOT NULL,
  next_month_prediction JSON,
  next_year_prediction JSON,
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
