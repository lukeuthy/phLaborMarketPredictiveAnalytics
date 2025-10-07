# Philippine Labor Market Analytics System
## Predictive Analytics of Labor Market Dynamics Using Data Mining

![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive data mining application for analyzing and forecasting Philippine labor market indicators using time series analysis and machine learning techniques.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Data Requirements](#data-requirements)
- [Methodology](#methodology)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
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

### Data Processing
- ✅ Automated data loading and validation
- ✅ Time series decomposition (trend, seasonal, residual)
- ✅ Statistical analysis and descriptive statistics
- ✅ Outlier detection and handling
- ✅ Missing value detection

### Forecasting Models
- ✅ ARIMA (AutoRegressive Integrated Moving Average)
- ✅ SARIMA (Seasonal ARIMA)
- ✅ Exponential Smoothing (ETS)
- ✅ Support Vector Regression (SVR)
- ✅ Random Forest Regression
- ✅ Gradient Boosting
- ✅ LSTM Neural Networks
- ✅ Ensemble Methods

### Visualization
- ✅ Interactive time series plots
- ✅ Trend and seasonal decomposition charts
- ✅ Forecast visualization with confidence intervals
- ✅ Correlation heatmaps
- ✅ Model performance comparison charts
- ✅ Export charts as PNG/PDF

### User Interface
- ✅ Modern, intuitive GUI
- ✅ Real-time data preview
- ✅ Interactive model configuration
- ✅ Progress tracking for long operations
- ✅ Comprehensive results dashboard

---

## 💻 System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Python**: Version 3.8 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Display**: 1280x720 minimum resolution

---

## 🚀 Installation

### Step 1: Clone or Download the Project

\`\`\`bash
# If using git
git clone <repository-url>
cd labor-market-analytics

# Or download and extract the ZIP file
\`\`\`

### Step 2: Create Virtual Environment (Recommended)

\`\`\`bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
\`\`\`

### Step 3: Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 4: Run the Application

\`\`\`bash
python main.py
\`\`\`

---

## 📦 Dependencies

### Core Libraries

\`\`\`
# Data Processing
numpy>=1.21.0
pandas>=1.3.0
scipy>=1.7.0

# Time Series Analysis
statsmodels>=0.13.0
pmdarima>=1.8.5

# Machine Learning
scikit-learn>=1.0.0
xgboost>=1.5.0
lightgbm>=3.3.0
tensorflow>=2.8.0
keras>=2.8.0

# Visualization
matplotlib>=3.4.0
seaborn>=0.11.0
plotly>=5.3.0

# GUI Framework
customtkinter>=5.0.0
tkinter (included with Python)
pillow>=9.0.0

# Utilities
python-dateutil>=2.8.0
openpyxl>=3.0.0
xlrd>=2.0.0
joblib>=1.1.0
\`\`\`

### Optional Dependencies

\`\`\`
# For advanced visualizations
dash>=2.0.0
dash-bootstrap-components>=1.0.0

# For database support
sqlalchemy>=1.4.0
psycopg2-binary>=2.9.0

# For report generation
reportlab>=3.6.0
fpdf>=1.7.2
\`\`\`

---

## 📁 Project Structure

\`\`\`
labor-market-analytics/
│
├── main.py                          # Application entry point
├── requirements.txt                 # Python dependencies
├── README.md                        # This file
├── WEKA_PREPROCESSING_INSTRUCTIONS.txt
│
├── data/
│   ├── raw/                         # Raw data files (CSV)
│   ├── processed/                   # Processed data files
│   └── results/                     # Analysis results and forecasts
│
├── src/
│   ├── __init__.py
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   ├── data_loader.py          # Data loading and validation
│   │   ├── data_validator.py       # Data quality checks
│   │   └── data_preprocessor.py    # Data preprocessing utilities
│   │
│   ├── analysis/
│   │   ├── __init__.py
│   │   ├── time_series_analyzer.py # Time series decomposition
│   │   ├── statistical_analyzer.py # Statistical analysis
│   │   └── correlation_analyzer.py # Correlation analysis
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── arima_model.py          # ARIMA implementation
│   │   ├── sarima_model.py         # SARIMA implementation
│   │   ├── ets_model.py            # Exponential Smoothing
│   │   ├── ml_models.py            # ML models (SVR, RF, GB)
│   │   ├── lstm_model.py           # LSTM neural network
│   │   └── ensemble_model.py       # Ensemble methods
│   │
│   ├── evaluation/
│   │   ├── __init__.py
│   │   ├── metrics.py              # Performance metrics
│   │   └── model_evaluator.py      # Model evaluation framework
│   │
│   ├── visualization/
│   │   ├── __init__.py
│   │   ├── time_series_plots.py    # Time series visualizations
│   │   ├── forecast_plots.py       # Forecast visualizations
│   │   ├── comparison_plots.py     # Model comparison charts
│   │   └── export_utils.py         # Chart export utilities
│   │
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── main_window.py          # Main application window
│   │   ├── components/
│   │   │   ├── __init__.py
│   │   │   ├── data_panel.py       # Data loading panel
│   │   │   ├── analysis_panel.py   # Analysis configuration panel
│   │   │   ├── forecast_panel.py   # Forecasting panel
│   │   │   ├── results_panel.py    # Results display panel
│   │   │   └── visualization_panel.py # Visualization panel
│   │   └── styles/
│   │       ├── __init__.py
│   │       └── theme.py            # UI theme and styling
│   │
│   └── utils/
│       ├── __init__.py
│       ├── config.py               # Configuration settings
│       ├── logger.py               # Logging utilities
│       └── helpers.py              # Helper functions
│
├── models/                          # Saved model files
│   └── .gitkeep
│
├── logs/                            # Application logs
│   └── .gitkeep
│
└── exports/                         # Exported charts and reports
    └── .gitkeep
\`\`\`

---

## 🎮 Usage

### 1. Data Preparation

Before using the application, preprocess your data in WEKA or using other data cleaning software by following the instructions similar in `WEKA_PREPROCESSING_INSTRUCTIONS.txt`.

Place your preprocessed CSV file in the `data/raw/` directory.

### 2. Launch Application

\`\`\`bash
python main.py
\`\`\`

### 3. Load Data

1. Click the **"Load Data"** button
2. Select your preprocessed CSV file
3. Review the data preview and statistics

### 4. Perform Analysis

1. Navigate to the **"Analysis"** tab
2. Select indicators to analyze
3. Choose analysis type:
   - Descriptive Statistics
   - Time Series Decomposition
   - Correlation Analysis
4. Click **"Run Analysis"**

### 5. Generate Forecasts

1. Navigate to the **"Forecast"** tab
2. Select forecasting model(s)
3. Configure parameters:
   - Forecast horizon (number of quarters)
   - Confidence level
   - Model-specific parameters
4. Click **"Generate Forecast"**

### 6. View Results

1. Navigate to the **"Results"** tab
2. View forecast plots and metrics
3. Compare model performance
4. Export results as CSV or charts as PNG/PDF

---

## 📊 Data Requirements

### Required Columns

Your CSV file must contain the following columns:

| Column Name | Data Type | Description | Valid Range |
|-------------|-----------|-------------|-------------|
| Quarter | String | Time period (e.g., "2014 Q1") | - |
| LFPR | Float | Labor Force Participation Rate | 0-100 |
| ER | Float | Employment Rate | 0-100 |
| UR | Float | Unemployment Rate | 0-100 |
| UER | Float | Underemployment Rate | 0-100 |

### Data Format Example

\`\`\`csv
Quarter,LFPR,ER,UR,UER
2014 Q1,64.2,93.5,6.5,18.9
2014 Q2,64.5,93.8,6.2,18.5
2014 Q3,64.1,93.6,6.4,19.1
...
\`\`\`

### Data Quality Requirements

- ✅ No missing values (or properly handled in WEKA)
- ✅ Chronological order
- ✅ Consistent time intervals (quarterly)
- ✅ Values within valid ranges
- ✅ No duplicate time periods

---

## 🔬 Methodology

This application implements the following analytical framework:

### Time Series Analysis
- Classical decomposition (additive/multiplicative)
- Trend extraction (moving averages, HP filter)
- Seasonal pattern identification
- Stationarity testing (ADF, KPSS)

### Forecasting Models

**Statistical Models:**
- ARIMA with automatic parameter selection
- SARIMA for seasonal patterns
- Exponential Smoothing State Space Models

**Machine Learning Models:**
- Support Vector Regression (RBF kernel)
- Random Forest Regression
- Gradient Boosting (XGBoost, LightGBM)
- LSTM Neural Networks

**Ensemble Methods:**
- Simple averaging
- Weighted averaging
- Stacked ensembles

### Model Evaluation

**Metrics:**
- Mean Absolute Error (MAE)
- Root Mean Square Error (RMSE)
- Mean Absolute Percentage Error (MAPE)
- Symmetric MAPE (sMAPE)
- Directional Accuracy

**Validation:**
- Time series cross-validation
- Rolling window validation
- Walk-forward validation

---

## 🔧 Troubleshooting

### Common Issues

**Issue 1: Application won't start**
\`\`\`
Error: ModuleNotFoundError: No module named 'customtkinter'
Solution: Install dependencies: pip install -r requirements.txt
\`\`\`

**Issue 2: Data file not loading**
\`\`\`
Error: File format not recognized
Solution: Ensure CSV file has correct format and column names
         Check WEKA_PREPROCESSING_INSTRUCTIONS.txt
\`\`\`

**Issue 3: Forecast generation fails**
\`\`\`
Error: Not enough data points for forecasting
Solution: Ensure at least 20 data points (5 years of quarterly data)
\`\`\`

**Issue 4: LSTM model training is slow**
\`\`\`
Solution: Reduce number of epochs or use GPU acceleration
         Install tensorflow-gpu if CUDA-compatible GPU available
\`\`\`

**Issue 5: Memory error during ensemble forecasting**
\`\`\`
Solution: Reduce number of models in ensemble
         Close other applications to free up RAM
\`\`\`

### Getting Help

If you encounter issues not covered here:
1. Check the application logs in `logs/` directory
2. Verify your data format matches requirements
3. Ensure all dependencies are correctly installed
4. Try with the sample dataset first

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

## 👥 Authors

Research Implementation Team

---

## 🙏 Acknowledgments

- Philippine Statistics Authority (PSA) for providing the data
- Research paper authors for the comprehensive methodology
- Open-source community for the excellent libraries used in this project

---

**For detailed preprocessing instructions, see `WEKA_PREPROCESSING_INSTRUCTIONS.txt`**

**For usage examples and tutorials, see the `docs/` directory (coming soon)**
#   p h L a b o r M a r k e t P r e d i c t i v e A n a l y t i c s  
 