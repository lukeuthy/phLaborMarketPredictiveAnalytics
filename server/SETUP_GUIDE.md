# Philippine Labor Analytics - Setup Guide

## Prerequisites

- Node.js 18+ (https://nodejs.org/)
- MariaDB 10.5+ (https://mariadb.org/)
- npm or yarn

## Backend Setup

### 1. Install Dependencies

\`\`\`bash
cd server
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

\`\`\`env
PORT=5000
DB_HOST=localhost
DB_USER=labor_user
DB_PASSWORD=your_secure_password
DB_NAME=labor_analytics
DB_PORT=3306
NODE_ENV=development
\`\`\`

### 3. Setup Database

\`\`\`bash
# Connect to MariaDB
mysql -u root -p

# Run the schema
mysql -u root -p < database/schema.sql

# Create application user
CREATE USER 'labor_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON labor_analytics.* TO 'labor_user'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

### 4. Seed Sample Data

\`\`\`bash
node database/seed.js
\`\`\`

### 5. Start Backend Server

\`\`\`bash
npm run dev
\`\`\`

Server will run on http://localhost:5000

## Frontend Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### 3. Start Frontend Development Server

\`\`\`bash
npm run dev
\`\`\`

Frontend will run on http://localhost:3000

## API Endpoints

### Data Management
- POST /api/data/upload - Upload labor data
- GET /api/data/datasets - Get all datasets
- GET /api/data/datasets/:id - Get dataset details
- GET /api/data/datasets/:id/summary - Get data summary
- GET /api/data/datasets/:id/export - Export as CSV
- DELETE /api/data/datasets/:id - Delete dataset

### Preprocessing
- POST /api/preprocessing/start/:datasetId - Start preprocessing
- GET /api/preprocessing/status/:datasetId - Get preprocessing status
- PUT /api/preprocessing/step/:stepId - Update preprocessing step

### Processing
- POST /api/processing/compare - Run algorithm comparison
- GET /api/processing/results/:id - Get comparison results

### Analytics
- GET /api/analytics/dataset/:id - Get analytics
- GET /api/analytics/sectors/:id - Get sector analysis

## Error Handling

All API responses follow this format:

**Success:**
\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
\`\`\`

**Error:**
\`\`\`json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`

## Troubleshooting

### Database Connection Error
- Verify MariaDB is running
- Check credentials in .env
- Ensure database user has proper permissions

### API Not Responding
- Check if backend server is running on port 5000
- Verify NEXT_PUBLIC_API_URL in frontend .env.local
- Check browser console for CORS errors

### Data Upload Fails
- Verify CSV format matches requirements
- Check file size (max 10MB)
- Ensure all required columns are present

## Production Deployment

1. Build frontend: \`npm run build\`
2. Set NODE_ENV=production in backend .env
3. Use a process manager like PM2 for backend
4. Configure proper database backups
5. Set up SSL/TLS certificates
6. Use environment-specific configurations
