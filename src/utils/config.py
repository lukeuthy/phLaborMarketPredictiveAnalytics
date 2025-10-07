"""
Configuration Settings
Centralized configuration for the application
"""

import os
from pathlib import Path

class Config:
    """Application configuration settings"""
    
    # Base directories
    BASE_DIR = Path(__file__).parent.parent.parent
    DATA_DIR = BASE_DIR / "data"
    RAW_DATA_DIR = DATA_DIR / "raw"
    PROCESSED_DATA_DIR = DATA_DIR / "processed"
    RESULTS_DIR = DATA_DIR / "results"
    MODELS_DIR = BASE_DIR / "models"
    LOGS_DIR = BASE_DIR / "logs"
    EXPORTS_DIR = BASE_DIR / "exports"
    
    # Data settings
    REQUIRED_COLUMNS = ['Quarter', 'LFPR', 'ER', 'UR', 'UER']
    INDICATOR_NAMES = {
        'LFPR': 'Labor Force Participation Rate',
        'ER': 'Employment Rate',
        'UR': 'Unemployment Rate',
        'UER': 'Underemployment Rate'
    }
    
    # Analysis settings
    MIN_DATA_POINTS = 20  # Minimum quarters needed for analysis
    DEFAULT_FORECAST_HORIZON = 4  # Default forecast quarters
    CONFIDENCE_LEVEL = 0.95  # 95% confidence interval
    
    # Model settings
    RANDOM_STATE = 42
    TEST_SIZE = 0.2
    CV_FOLDS = 5
    
    # UI settings
    WINDOW_TITLE = "Philippine Labor Market Analytics System"
    WINDOW_SIZE = "1400x900"
    THEME = "dark"
    
    # Color scheme for indicators
    INDICATOR_COLORS = {
        'LFPR': '#2E86AB',  # Blue
        'ER': '#06A77D',    # Green
        'UR': '#D62828',    # Red
        'UER': '#F77F00'    # Orange
    }
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories if they don't exist"""
        directories = [
            cls.DATA_DIR,
            cls.RAW_DATA_DIR,
            cls.PROCESSED_DATA_DIR,
            cls.RESULTS_DIR,
            cls.MODELS_DIR,
            cls.LOGS_DIR,
            cls.EXPORTS_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
            # Create .gitkeep file to preserve empty directories
            gitkeep = directory / ".gitkeep"
            if not gitkeep.exists():
                gitkeep.touch()
