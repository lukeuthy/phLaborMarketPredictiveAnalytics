"""
Data Loader
Handles loading and initial processing of labor market data
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
from ..utils.config import Config
from ..utils.logger import setup_logger
from ..utils.helpers import quarter_to_date

logger = setup_logger()

class DataLoader:
    """Handles loading and initial processing of labor market data"""
    
    def __init__(self):
        self.data = None
        self.metadata = {}
        
    def load_csv(self, file_path: str) -> pd.DataFrame:
        """
        Load data from CSV file
        
        Args:
            file_path: Path to CSV file
            
        Returns:
            Loaded DataFrame
        """
        try:
            logger.info(f"Loading data from {file_path}")
            
            # Load CSV
            df = pd.read_csv(file_path)
            
            # Validate columns
            missing_cols = set(Config.REQUIRED_COLUMNS) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Convert Quarter to datetime
            df['Date'] = df['Quarter'].apply(quarter_to_date)
            
            # Sort by date
            df = df.sort_values('Date').reset_index(drop=True)
            
            # Store metadata
            self.metadata = {
                'file_path': file_path,
                'n_records': len(df),
                'start_date': df['Quarter'].iloc[0],
                'end_date': df['Quarter'].iloc[-1],
                'columns': list(df.columns)
            }
            
            self.data = df
            logger.info(f"Successfully loaded {len(df)} records")
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def get_indicator_data(self, indicator: str) -> pd.Series:
        """
        Get data for specific indicator
        
        Args:
            indicator: Indicator name (LFPR, ER, UR, UER)
            
        Returns:
            Pandas Series with indicator data
        """
        if self.data is None:
            raise ValueError("No data loaded. Call load_csv() first.")
        
        if indicator not in Config.REQUIRED_COLUMNS[1:]:
            raise ValueError(f"Invalid indicator: {indicator}")
        
        return self.data[indicator]
    
    def get_date_range(self) -> tuple:
        """
        Get date range of loaded data
        
        Returns:
            Tuple of (start_date, end_date)
        """
        if self.data is None:
            return None, None
        
        return self.data['Quarter'].iloc[0], self.data['Quarter'].iloc[-1]
    
    def get_summary_statistics(self) -> Dict[str, Dict[str, float]]:
        """
        Calculate summary statistics for all indicators
        
        Returns:
            Dictionary of statistics for each indicator
        """
        if self.data is None:
            raise ValueError("No data loaded")
        
        stats = {}
        for indicator in Config.REQUIRED_COLUMNS[1:]:
            data = self.data[indicator]
            stats[indicator] = {
                'mean': data.mean(),
                'median': data.median(),
                'std': data.std(),
                'min': data.min(),
                'max': data.max(),
                'q25': data.quantile(0.25),
                'q75': data.quantile(0.75)
            }
        
        return stats
    
    def export_processed_data(self, output_path: Optional[str] = None) -> str:
        """
        Export processed data to CSV
        
        Args:
            output_path: Output file path (optional)
            
        Returns:
            Path to exported file
        """
        if self.data is None:
            raise ValueError("No data to export")
        
        if output_path is None:
            output_path = Config.PROCESSED_DATA_DIR / "processed_data.csv"
        
        self.data.to_csv(output_path, index=False)
        logger.info(f"Data exported to {output_path}")
        
        return str(output_path)
