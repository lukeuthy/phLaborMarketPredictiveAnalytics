# Philippine Labor Market Analytics System
## Predictive Analytics of Labor Market Dynamics Using Data Mining

![Node.js Version](https://img.shields.io/badge/node.js-18%2B-green)
![Next.js Version](https://img.shields.io/badge/next.js-15-black)
![MariaDB](https://img.shields.io/badge/mariadb-11-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive full-stack data mining application for analyzing and forecasting Philippine labor market indicators using time series analysis and machine learning techniques.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Data Requirements](#data-requirements)
- [API Endpoints](#api-endpoints)
- [Methodology](#methodology)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

This application implements the methodology described in the research paper "Predictive Analytics of Philippine Labor Market Dynamics: A Data Mining Approach Using Time Series Analysis of Employment Indicators (2014-2024)".

The system analyzes four key labor market indicators:
- **Labor Force Participation Rate (LFPR)**
- **Employment Rate (ER)**
- **Unemployment Rate (UR)**
- **Underemployment Rate (UER)**

Data source: Philippine Statistics Authority (PSA) Labor Force Survey

---

## ✨ Features

### Frontend (Next.js + React)
- ✅ Modern, responsive web interface
- ✅ Real-time data upload and validation
- ✅ Interactive preprocessing pipeline
- ✅ Algorithm comparison dashboard
- ✅ Advanced analytics and insights
- ✅ Performance metrics visualization
- ✅ Real-time processing status tracking

### Backend (Node.js + Express)
- ✅ RESTful API with 15+ endpoints
- ✅ Automated data loading and validation
- ✅ Time series decomposition
- ✅ Statistical analysis
- ✅ Outlier detection and handling
- ✅ Missing value detection

### Forecasting Models
- ✅ ARIMA (AutoRegressive Integrated Moving Average)
- ✅ SARIMA (Seasonal ARIMA)
- ✅ Support Vector Regression (SVR)
- ✅ Random Forest Regression
- ✅ Gradient Boosting
- ✅ LSTM Neural Networks
- ✅ Ensemble Methods

### Database (MariaDB)
- ✅ Optimized schema for labor market data
- ✅ Efficient data storage and retrieval
- ✅ Processing results caching
- ✅ Preprocessing logs tracking

---

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (React framework)
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Radix UI (components)

**Backend:**
- Node.js 18+
- Express.js
- MariaDB 11
- Simple-Statistics (algorithms)

**Data Processing:**
- CSV parsing
- Time series analysis
- Statistical computations
- Machine learning algorithms

---

## 💻 System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18 or higher
- **MariaDB**: Version 11 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 1GB free space
- **Display**: 1280x720 minimum resolution

---

## 🚀 Installation

### Step 1: Clone or Download the Project

\`\`\`bash
git clone <repository-url>
cd labor-market-analytics
\`\`\`

### Step 2: Install Frontend Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Install Backend Dependencies

\`\`\`bash
cd server
npm install
cd ..
\`\`\`

### Step 4: Setup MariaDB

\`\`\`bash
# Create database and tables
mysql -u root -p < server/database/schema.sql

# Or follow detailed instructions in:
cat server/DATABASE_SETUP.md
\`\`\`

### Step 5: Configure Environment Variables

Create \`.env.local\` in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

Create \`.env\` in the \`server/\` directory:

\`\`\`env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=labor_analytics
NODE_ENV=development
\`\`\`

### Step 6: Run the Application

**Terminal 1 - Backend:**
\`\`\`bash
cd server
npm start
# Server runs on http://localhost:3001
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
npm run dev
# Frontend runs on http://localhost:3000
\`\`\`

---

## 📦 Dependencies

### Frontend (Next.js)

\`\`\`json
{
  "dependencies": {
    "next": "^15.5.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "recharts": "^2.15.4",
    "tailwindcss": "^4.1.9",
    "radix-ui": "latest",
    "lucide-react": "latest",
    "react-hook-form": "latest",
    "zod": "latest"
  }
}
\`\`\`

### Backend (Node.js)

\`\`\`json
{
  "dependencies": {
    "express": "^4.18.0",
    "mariadb": "^3.2.0",
    "csv-parse": "^5.4.0",
    "simple-statistics": "^7.8.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "multer": "^1.4.5"
  }
}
\`\`\`

---

## 📁 Project Structure

\`\`\`
labor-market-analytics/
│
├── app/                             # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── dashboard/
│   ├── upload/
│   ├── preprocessing/
│   ├── processing/
│   ├── results/
│   └── settings/
│
├── components/                      # React components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── sidebar.tsx
│   ├── dashboard/
│   ├── upload/
│   ├── preprocessing/
│   ├── processing/
│   ├── results/
│   ├── metrics/
│   ├── monitoring/
│   └── ui/
│
├── lib/                             # Utilities
│   ├── api-client.ts
│   └── utils.ts
│
├── hooks/                           # React hooks
│   └── use-api.ts
│
├── server/                          # Node.js backend
│   ├── index.js                     # Express server entry point
│   ├── package.json
│   ├── .env.example
│   │
│   ├── config/
│   │   └── database.js              # MariaDB connection
│   │
│   ├── database/
│   │   ├── schema.sql               # Database schema
│   │   ├── seed.js                  # Database seeding
│   │   └── DATABASE_SETUP.md
│   │
│   ├── routes/
│   │   ├── data.js                  # Data management endpoints
│   │   ├── preprocessing.js         # Preprocessing endpoints
│   │   ├── processing.js            # Algorithm processing endpoints
│   │   └── analytics.js             # Analytics endpoints
│   │
│   ├── services/
│   │   ├── data-loader.js           # CSV loading and parsing
│   │   ├── data-validator.js        # Data validation
│   │   ├── data-preprocessor.js     # Feature engineering
│   │   ├── time-series-analyzer.js  # Time series analysis
│   │   ├── algorithms.js            # ML algorithms
│   │   └── analytics.js             # Analytics computations
│   │
│   ├── middleware/
│   │   ├── error-handler.js
│   │   ├── validation.js
│   │   └── logger.js
│   │
│   └── SETUP_GUIDE.md
│
├── data/                            # Data directories
│   ├── raw/
│   ├── processed/
│   └── results/
│
├── public/                          # Static assets
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

---

## 🎮 Usage

### 1. Access the Application

Open your browser and navigate to: \`http://localhost:3000\`

### 2. Upload Data

1. Click **"Upload Data"** in the sidebar
2. Drag and drop or select your CSV file
3. Review the data preview
4. Click **"Validate & Upload"**

### 3. Preprocess Data

1. Navigate to **"Preprocessing"**
2. Configure preprocessing steps:
   - Handle missing values
   - Detect and handle outliers
   - Normalize data
   - Create features
3. Click **"Run Preprocessing"**
4. Review preprocessing report

### 4. Process with Algorithms

1. Navigate to **"Processing"**
2. Select algorithms to compare:
   - ARIMA, SARIMA, SVR, Random Forest, LSTM, Gradient Boosting
3. Configure parameters for each algorithm
4. Click **"Run Comparison"**
5. View performance metrics

### 5. View Analytics

1. Navigate to **"Results"**
2. View forecasts and trends
3. Analyze insights and patterns
4. Export reports and charts

---

## 📊 Data Requirements

### Required Columns

Your CSV file must contain:

| Column | Type | Range | Example |
|--------|------|-------|---------|
| Quarter | String | - | "2024 Q1" |
| LFPR | Float | 0-100 | 64.5 |
| ER | Float | 0-100 | 93.8 |
| UR | Float | 0-100 | 6.2 |
| UER | Float | 0-100 | 18.5 |

### Data Format Example

\`\`\`csv
Quarter,LFPR,ER,UR,UER
2014 Q1,64.2,93.5,6.5,18.9
2014 Q2,64.5,93.8,6.2,18.5
2014 Q3,64.1,93.6,6.4,19.1
\`\`\`

---

## 🔌 API Endpoints

### Data Management
- \`POST /api/data/upload\` - Upload CSV file
- \`GET /api/data/list\` - List uploaded datasets
- \`GET /api/data/:id\` - Get dataset details
- \`DELETE /api/data/:id\` - Delete dataset

### Preprocessing
- \`POST /api/preprocessing/validate\` - Validate data
- \`POST /api/preprocessing/process\` - Run preprocessing
- \`GET /api/preprocessing/status/:id\` - Get preprocessing status

### Processing
- \`POST /api/processing/compare\` - Run algorithm comparison
- \`GET /api/processing/results/:id\` - Get processing results
- \`GET /api/processing/metrics/:id\` - Get performance metrics

### Analytics
- \`GET /api/analytics/insights/:id\` - Get insights
- \`GET /api/analytics/forecast/:id\` - Get forecasts
- \`POST /api/analytics/export\` - Export results

---

## 🔬 Methodology

### Time Series Analysis
- Classical decomposition (additive/multiplicative)
- Trend extraction (moving averages)
- Seasonal pattern identification
- Stationarity testing

### Forecasting Models

**Statistical Models:**
- ARIMA with automatic parameter selection
- SARIMA for seasonal patterns

**Machine Learning Models:**
- Support Vector Regression
- Random Forest Regression
- Gradient Boosting
- LSTM Neural Networks

**Ensemble Methods:**
- Simple averaging
- Weighted averaging

### Model Evaluation

**Metrics:**
- Mean Absolute Error (MAE)
- Root Mean Square Error (RMSE)
- Mean Absolute Percentage Error (MAPE)

**Validation:**
- Time series cross-validation
- Walk-forward validation

---

## 🔧 Troubleshooting

### Backend won't start
\`\`\`
Error: Cannot connect to MariaDB
Solution: Verify MariaDB is running and credentials in .env are correct
\`\`\`

### Frontend can't reach backend
\`\`\`
Error: API connection failed
Solution: Ensure backend is running on port 3001
         Check NEXT_PUBLIC_API_URL in .env.local
\`\`\`

### Data upload fails
\`\`\`
Error: Invalid CSV format
Solution: Verify CSV has required columns: Quarter, LFPR, ER, UR, UER
\`\`\`

### Processing is slow
\`\`\`
Solution: Reduce dataset size or number of algorithms
         Increase server RAM allocation
\`\`\`

---

## 📄 License

This project is licensed under the MIT License.

---

## 📚 References

Based on the research paper:
"Predictive Analytics of Philippine Labor Market Dynamics: A Data Mining Approach Using Time Series Analysis of Employment Indicators (2014-2024)"

Data Source:
Philippine Statistics Authority (PSA) - Labor Force Survey
https://openstat.psa.gov.ph/

---

**For detailed database setup, see \`server/DATABASE_SETUP.md\`**

**For backend setup guide, see \`server/SETUP_GUIDE.md\`**
