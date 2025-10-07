"""
Helper Functions
Utility functions used across the application
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Tuple

def parse_quarter(quarter_str: str) -> Tuple[int, int]:
    """
    Parse quarter string to year and quarter number
    
    Args:
        quarter_str: Quarter string (e.g., "2014 Q1")
        
    Returns:
        Tuple of (year, quarter_number)
    """
    try:
        parts = quarter_str.strip().split()
        year = int(parts[0])
        quarter = int(parts[1].replace('Q', ''))
        return year, quarter
    except:
        raise ValueError(f"Invalid quarter format: {quarter_str}")

def quarter_to_date(quarter_str: str) -> pd.Timestamp:
    """
    Convert quarter string to pandas Timestamp
    
    Args:
        quarter_str: Quarter string (e.g., "2014 Q1")
        
    Returns:
        Pandas Timestamp
    """
    year, quarter = parse_quarter(quarter_str)
    month = (quarter - 1) * 3 + 1
    return pd.Timestamp(year=year, month=month, day=1)

def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format value as percentage string
    
    Args:
        value: Numeric value
        decimals: Number of decimal places
        
    Returns:
        Formatted percentage string
    """
    return f"{value:.{decimals}f}%"

def calculate_change(current: float, previous: float) -> float:
    """
    Calculate percentage change
    
    Args:
        current: Current value
        previous: Previous value
        
    Returns:
        Percentage change
    """
    if previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100

def validate_data_range(data: pd.Series, min_val: float = 0, max_val: float = 100) -> bool:
    """
    Validate that data values are within expected range
    
    Args:
        data: Pandas Series
        min_val: Minimum valid value
        max_val: Maximum valid value
        
    Returns:
        True if all values are valid
    """
    return data.between(min_val, max_val).all()

def detect_outliers_iqr(data: pd.Series, factor: float = 1.5) -> pd.Series:
    """
    Detect outliers using IQR method
    
    Args:
        data: Pandas Series
        factor: IQR multiplier factor
        
    Returns:
        Boolean Series indicating outliers
    """
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    
    lower_bound = Q1 - factor * IQR
    upper_bound = Q3 + factor * IQR
    
    return (data < lower_bound) | (data > upper_bound)

def create_lag_features(data: pd.Series, lags: List[int]) -> pd.DataFrame:
    """
    Create lagged features for time series
    
    Args:
        data: Pandas Series
        lags: List of lag periods
        
    Returns:
        DataFrame with lagged features
    """
    df = pd.DataFrame()
    for lag in lags:
        df[f'lag_{lag}'] = data.shift(lag)
    return df

def calculate_moving_average(data: pd.Series, window: int) -> pd.Series:
    """
    Calculate moving average
    
    Args:
        data: Pandas Series
        window: Window size
        
    Returns:
        Moving average Series
    """
    return data.rolling(window=window, center=False).mean()

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safely divide two numbers, returning default if denominator is zero
    
    Args:
        numerator: Numerator
        denominator: Denominator
        default: Default value if division by zero
        
    Returns:
        Division result or default
    """
    return numerator / denominator if denominator != 0 else default
