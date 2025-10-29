# MariaDB Setup Guide

## Installation

### Windows
1. Download MariaDB from https://mariadb.org/download/
2. Run the installer
3. Choose default settings or customize as needed
4. Remember your root password

### macOS
\`\`\`bash
brew install mariadb
brew services start mariadb
\`\`\`

### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt-get install mariadb-server
sudo systemctl start mariadb
\`\`\`

## Initial Setup

1. Connect to MariaDB:
\`\`\`bash
mysql -u root -p
\`\`\`

2. Run the schema file:
\`\`\`bash
mysql -u root -p < server/database/schema.sql
\`\`\`

3. Create a user for the application:
\`\`\`sql
CREATE USER 'labor_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON labor_analytics.* TO 'labor_user'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

4. Update `.env` file:
\`\`\`
DB_HOST=localhost
DB_USER=labor_user
DB_PASSWORD=your_secure_password
DB_NAME=labor_analytics
DB_PORT=3306
\`\`\`

5. Seed sample data:
\`\`\`bash
node server/database/seed.js
\`\`\`

## Database Structure

- **datasets**: Stores uploaded datasets metadata
- **labor_data**: Stores actual labor market indicators
- **processing_results**: Stores algorithm comparison results
- **preprocessing_logs**: Tracks preprocessing steps
- **analytics_cache**: Caches computed analytics for performance

## Backup

\`\`\`bash
mysqldump -u root -p labor_analytics > backup.sql
\`\`\`

## Restore

\`\`\`bash
mysql -u root -p labor_analytics < backup.sql
