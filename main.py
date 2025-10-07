"""
Philippine Labor Market Analytics System
Main Application Entry Point
"""

import sys
import os
from pathlib import Path

# Add src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.ui.main_window import LaborMarketApp
from src.utils.logger import setup_logger
from src.utils.config import Config

def main():
    """
    Main function to start the application
    """
    # Setup logging
    logger = setup_logger()
    logger.info("Starting Philippine Labor Market Analytics System")
    
    # Create necessary directories
    Config.create_directories()
    
    try:
        # Initialize and run the application
        app = LaborMarketApp()
        app.run()
        
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        print(f"Error starting application: {str(e)}")
        sys.exit(1)
    
    finally:
        logger.info("Application closed")

if __name__ == "__main__":
    main()
