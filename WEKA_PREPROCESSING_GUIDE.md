# WEKA Preprocessing Guide for Philippine Labor Market Data

This guide walks you through preprocessing your Philippine labor market data in WEKA for optimal model performance.

## Step 1: Data Import

### Option 1: Using CSV File
1. Open WEKA → Click "Explorer"
2. Go to "Preprocess" tab
3. Click "Open file..." → Select `philippine-labor-market-2014-2024-complete.csv`
4. WEKA auto-detects CSV format
5. Verify all 15 attributes appear in the attribute list

### Option 2: Manual Loader
1. Click "Open file..." → Change filter to "All files"
2. Select your CSV file
3. WEKA should auto-detect delimiter (comma)
4. Click "Open"

## Step 2: Attribute Understanding

Your dataset contains these attributes:

**Temporal**: Year, Month, Date

**Population (15+)**:
- Total Population (Both, Male, Female)

**Labor Force**:
- Persons in Labor Force (Both, Male, Female)

**Employment**:
- Employed Persons (Both, Male, Female)

**Unemployment**:
- Unemployed Persons (Both, Male, Female)

**Underemployment**:
- Underemployed Persons (Both, Male, Female)

## Step 3: Data Cleaning

### Remove Unnecessary Attributes
1. Select "Preprocess" tab
2. Select attribute "Year" → Click "Remove"
3. Select "Month" → Keep (useful for seasonal analysis)
4. Select "Date" → Click "Remove" (redundant with Year/Month)

**Reason**: Keep Month for seasonal patterns, remove redundant temporal fields

### Handle Missing Values
1. Click "Filters" → "Unsupervised" → "Attribute" → "ReplaceMissingValues"
2. Click "More Options..." → Configure:
   - Method: Mean for numerical attributes
   - Click "Apply"

**Your data**: Already complete (no missing values), but this is good practice

## Step 4: Data Normalization

### Normalize All Numerical Attributes
1. Click "Filters" → "Unsupervised" → "Attribute" → "Normalize"
2. Configure:
   - Scale: 0 to 1
   - Click "Apply"

**Why**: Different scales (population vs rates) need normalization for ML algorithms

### Alternative: Standardization
1. Click "Filters" → "Unsupervised" → "Attribute" → "Standardize"
2. Configure:
   - Mean: 0
   - Std Dev: 1
   - Click "Apply"

**Use when**: Comparing with standard statistical tests

## Step 5: Outlier Detection

### Method 1: Statistical (Z-score)
1. Click "Filters" → "Unsupervised" → "Instance" → "Randomize"
2. Click "Filters" → "Supervised" → "Attribute" → "InterquartileRange"
3. Configure:
   - Remove?: Yes (to filter outliers) or No (to flag)
   - Click "Apply"

### Method 2: Visual Detection
1. Go to "Visualize" tab
2. Select each attribute to plot
3. Look for points far from main cluster
4. Manual review: Determine if outlier represents real economic event (COVID-19) or error

**For your data**: COVID-19 impact (Q2 2020) shows legitimate outliers—KEEP these

## Step 6: Feature Engineering for Time Series

### Create Lagged Features
1. Click "Filters" → "Unsupervised" → "Attribute" → "AddExpression"
2. Create lag-1 feature (previous month's value):
   - Expression: `lag(Employed_Persons_Both, 1)`
   - New attribute name: `Employed_Lag1`
   - Click "Apply"
3. Repeat for lag-2, lag-3 if needed

### Create Seasonal Features
1. Create seasonal indicator:
   - Expression: `if(Month==1 || Month==4 || Month==7 || Month==10, 1, 0)`
   - New attribute name: `IsQuarter`
   - Click "Apply"

### Create Rate Features
1. Calculate Employment Rate:
   - Expression: `(Employed_Persons_Both / Persons_In_Labor_Force_Both) * 100`
   - New attribute name: `Employment_Rate`
   - Click "Apply"

2. Calculate Unemployment Rate:
   - Expression: `(Unemployed_Persons_Both / Persons_In_Labor_Force_Both) * 100`
   - New attribute name: `Unemployment_Rate`
   - Click "Apply"

3. Calculate Labor Force Participation Rate:
   - Expression: `(Persons_In_Labor_Force_Both / Total_Population_Both) * 100`
   - New attribute name: `LFPR`
   - Click "Apply"

## Step 7: Attribute Selection

### Correlation Analysis
1. Go to "Select attributes" tab
2. Attribute evaluator: "CorrelationAttributeEval"
3. Search method: "Ranker"
4. Click "Start"
5. Review attribute rankings (highest = most relevant)

### Information Gain Analysis
1. Attribute evaluator: "InfoGainAttributeEval"
2. Search method: "Ranker"
3. Click "Start"
4. Compare with correlation results

**For time series forecasting**: Keep lagged features, temporal indicators, and engineered rates

## Step 8: Instance Filtering

### Remove Incomplete Records
1. Click "Filters" → "Unsupervised" → "Instance" → "RemoveMissingValues"
2. Configure:
   - Class index: First attribute
   - Click "Apply"

### Create Train/Test Split
1. Click "Filters" → "Unsupervised" → "Instance" → "Resample"
2. Configure:
   - Sample size: 80% (training)
   - Seed: 42 (reproducibility)
   - Click "Apply"
3. Save this as "train_set.arff"
4. Repeat with 20% for "test_set.arff"

## Step 9: Time Series Preparation

### Save Preprocessed Data
1. Right-click on dataset in instance list
2. Click "Save..." 
3. Save as: `labor-market-preprocessed.arff` (WEKA format)
4. Also save as: `labor-market-preprocessed.csv` (for other tools)

### For Time Series Models (ARIMA, etc.)
1. Keep temporal ordering (Month sequence)
2. DO NOT randomize instances
3. Create lagged variables
4. Ensure target variable is clearly defined (e.g., "Unemployment_Rate")

## Step 10: Export for Modeling

### Export Final Dataset
1. Go to "Preprocess" tab
2. Click "Save..." → Choose format:
   - **ARFF**: WEKA native format (best for WEKA models)
   - **CSV**: For other tools and applications

### Create Metadata Document
Create a text file documenting:
\`\`\`
Dataset: Philippine Labor Market (2014-2024)
Instances: 123 (monthly data)
Attributes: [list all final attributes]
Missing values: None
Preprocessing applied:
- Normalized to 0-1 scale
- Created lagged features (lag-1, lag-2)
- Engineered LFPR, ER, UR rates
- Removed temporal redundancy
\`\`\`

## Key Preprocessing Parameters for Different Models

### For ARIMA/SARIMA
- Keep original scale (no normalization)
- Maintain time series order
- Include seasonal lag features
- Target: Single indicator (e.g., Unemployment_Rate)

### For Machine Learning (RF, SVM, etc.)
- Normalize to 0-1 or standardize
- Include lagged features (3-6 lags)
- Include engineered rates
- Include seasonal indicators

### For Neural Networks (LSTM)
- Normalize to 0-1
- Create sequences (window size: 12 months)
- Include all feature engineered attributes
- May need additional preprocessing (log transformation if skewed)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Missing values | Use "ReplaceMissingValues" filter with mean imputation |
| Scale mismatch | Normalize using "Normalize" filter to 0-1 range |
| Outliers causing problems | Review against economic events; retain legitimate outliers |
| Temporal leakage | Keep instances in order; don't randomize for time series |
| Class imbalance | Not applicable—regression problem; focus on scale matching |
| Too many attributes | Use "Select Attributes" with information gain |

## Final Checklist Before Modeling

- [ ] Data imported successfully (123 instances)
- [ ] All 15 original attributes present
- [ ] Temporal redundancy removed
- [ ] Numerical attributes normalized or standardized
- [ ] Lagged features created
- [ ] Rate features engineered (LFPR, ER, UR)
- [ ] Seasonal indicators included
- [ ] Outliers reviewed and validated
- [ ] Train/test split created (80/20)
- [ ] Final dataset saved in both ARFF and CSV formats
- [ ] Metadata document created

---

## Next Steps

1. **For Forecasting**: Load preprocessed data into Classifier tab → Use ARIMA implementation
2. **For Classification**: Use preprocessed data with Random Forest, SVM, Neural Network
3. **For Time Series**: Export to R or Python for specialized time series libraries
4. **For Your Application**: Upload preprocessed CSV to the labor market analytics platform