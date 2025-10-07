"""
Data Preprocessor
Additional preprocessing utilities for analysis
"""

import pandas as pd
import numpy as np
from typing import List, Optional
from ..utils.config import Config
from ..utils.logger import setup_logger
from ..utils.helpers import create_lag_features, calculate_moving_average

logger = setup_logger()

class DataPreprocessor:
    """Preprocessing utilities for time series analysis"""
    
    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        
    def create_temporal_features(self) -> pd.DataFrame:
        """
        Create temporal features (year, quarter, month)
        
        Returns:
            DataFrame with added temporal features
        """
        logger.info("Creating temporal features")
        
        df = self.data.copy()
        
        # Extract year and quarter
        df['Year'] = df['Date'].dt.year
        df['QuarterNum'] = df['Date'].dt.quarter
        df['Month'] = df['Date'].dt.month
        
        # Create cyclical features for seasonality
        df['Quarter_sin'] = np.sin(2 * np.pi * df['QuarterNum'] / 4)
        df['Quarter_cos'] = np.cos(2 * np.pi * df['QuarterNum'] / 4)
        
        return df
    
    def add_lag_features(self, indicators: List[str], lags: List[int]) -> pd.DataFrame:
        """
        Add lagged features for specified indicators
        
        Args:
            indicators: List of indicator names
            lags: List of lag periods
            
        Returns:
            DataFrame with lagged features
        """
        logger.info(f"Adding lag features: {lags}")
        
        df = self.data.copy()
        
        for indicator in indicators:
            lag_df = create_lag_features(df[indicator], lags)
            lag_df.columns = [f'{indicator}_{col}' for col in lag_df.columns]
            df = pd.concat([df, lag_df], axis=1)
        
        return df
    
    def add_moving_averages(self, indicators: List[str], windows: List[int]) -> pd.DataFrame:
        """
        Add moving average features
        
        Args:
            indicators: List of indicator names
            windows: List of window sizes
            
        Returns:
            DataFrame with moving average features
        """
        logger.info(f"Adding moving averages: {windows}")
        
        df = self.data.copy()
        
        for indicator in indicators:
            for window in windows:
                ma = calculate_moving_average(df[indicator], window)
                df[f'{indicator}_ma{window}'] = ma
        
        return df
    
    def add_rate_of_change(self, indicators: List[str], periods: List[int] = [1, 4]) -> pd.DataFrame:
        """
        Add rate of change features
        
        Args:
            indicators: List of indicator names
            periods: List of periods for change calculation
            
        Returns:
            DataFrame with rate of change features
        """
        logger.info(f"Adding rate of change features: {periods}")
        
        df = self.data.copy()
        
        for indicator in indicators:
            for period in periods:
                change = df[indicator].pct_change(periods=period) * 100
                df[f'{indicator}_change{period}'] = change
        
        return df
    
    def normalize_indicators(self, indicators: List[str], method: str = 'zscore') -> pd.DataFrame:
        """
        Normalize indicator values
        
        Args:
            indicators: List of indicator names
            method: Normalization method ('zscore' or 'minmax')
            
        Returns:
            DataFrame with normalized indicators
        """
        logger.info(f"Normalizing indicators using {method}")
        
        df = self.data.copy()
        
        for indicator in indicators:
            if method == 'zscore':
                mean = df[indicator].mean()
                std = df[indicator].std()
                df[f'{indicator}_norm'] = (df[indicator] - mean) / std
            elif method == 'minmax':
                min_val = df[indicator].min()
                max_val = df[indicator].max()
                df[f'{indicator}_norm'] = (df[indicator] - min_val) / (max_val - min_val)
        
        return df
    
    def prepare_for_modeling(self, 
                            target_indicator: str,
                            include_lags: bool = True,
                            include_ma: bool = True,
                            include_temporal: bool = True) -> pd.DataFrame:
        """
        Prepare comprehensive feature set for modeling
        
        Args:
            target_indicator: Target indicator for prediction
            include_lags: Include lagged features
            include_ma: Include moving averages
            include_temporal: Include temporal features
            
        Returns:
            DataFrame ready for modeling
        """
        logger.info(f"Preparing data for modeling: {target_indicator}")
        
        df = self.data.copy()
        
        if include_temporal:
            df = self.create_temporal_features()
        
        if include_lags:
            df = self.add_lag_features([target_indicator], [1, 2, 4])
        
        if include_ma:
            df = self.add_moving_averages([target_indicator], [2, 4])
        
        # Add rate of change
        df = self.add_rate_of_change([target_indicator])
        
        # Drop rows with NaN values created by lagging/MA
        df = df.dropna()
        
        logger.info(f"Prepared dataset shape: {df.shape}")
        
        return df
