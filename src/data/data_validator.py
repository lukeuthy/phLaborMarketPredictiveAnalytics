"""
Data Validator
Validates data quality and integrity
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from ..utils.config import Config
from ..utils.logger import setup_logger
from ..utils.helpers import validate_data_range, detect_outliers_iqr

logger = setup_logger()

class DataValidator:
    """Validates data quality and integrity"""
    
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.validation_results = {}
        
    def validate_all(self) -> Dict[str, any]:
        """
        Run all validation checks
        
        Returns:
            Dictionary of validation results
        """
        logger.info("Running data validation checks")
        
        results = {
            'missing_values': self.check_missing_values(),
            'data_ranges': self.check_data_ranges(),
            'temporal_continuity': self.check_temporal_continuity(),
            'outliers': self.detect_outliers(),
            'consistency': self.check_consistency(),
            'overall_valid': True
        }
        
        # Determine overall validity
        results['overall_valid'] = (
            not results['missing_values']['has_missing'] and
            results['data_ranges']['all_valid'] and
            results['temporal_continuity']['is_continuous']
        )
        
        self.validation_results = results
        return results
    
    def check_missing_values(self) -> Dict[str, any]:
        """
        Check for missing values
        
        Returns:
            Dictionary with missing value information
        """
        missing_counts = self.data[Config.REQUIRED_COLUMNS].isnull().sum()
        
        return {
            'has_missing': missing_counts.sum() > 0,
            'counts': missing_counts.to_dict(),
            'total_missing': int(missing_counts.sum())
        }
    
    def check_data_ranges(self) -> Dict[str, any]:
        """
        Check if data values are within valid ranges
        
        Returns:
            Dictionary with range validation results
        """
        results = {}
        all_valid = True
        
        for indicator in Config.REQUIRED_COLUMNS[1:]:
            is_valid = validate_data_range(self.data[indicator], 0, 100)
            results[indicator] = {
                'valid': bool(is_valid),
                'min': float(self.data[indicator].min()),
                'max': float(self.data[indicator].max())
            }
            if not is_valid:
                all_valid = False
        
        return {
            'all_valid': all_valid,
            'indicators': results
        }
    
    def check_temporal_continuity(self) -> Dict[str, any]:
        """
        Check for gaps in time series
        
        Returns:
            Dictionary with temporal continuity information
        """
        dates = pd.to_datetime(self.data['Date'])
        
        # Calculate expected number of quarters
        date_range = (dates.max() - dates.min()).days
        expected_quarters = (date_range // 90) + 1
        actual_quarters = len(dates)
        
        # Check for gaps
        date_diffs = dates.diff()[1:]
        expected_diff = pd.Timedelta(days=90)
        gaps = date_diffs[date_diffs > expected_diff * 1.5]
        
        return {
            'is_continuous': len(gaps) == 0,
            'expected_quarters': int(expected_quarters),
            'actual_quarters': int(actual_quarters),
            'gaps_found': len(gaps),
            'gap_locations': [str(self.data.loc[idx, 'Quarter']) for idx in gaps.index] if len(gaps) > 0 else []
        }
    
    def detect_outliers(self) -> Dict[str, any]:
        """
        Detect outliers in indicators
        
        Returns:
            Dictionary with outlier information
        """
        results = {}
        
        for indicator in Config.REQUIRED_COLUMNS[1:]:
            outliers = detect_outliers_iqr(self.data[indicator])
            outlier_indices = self.data[outliers].index.tolist()
            
            results[indicator] = {
                'count': int(outliers.sum()),
                'percentage': float(outliers.sum() / len(self.data) * 100),
                'quarters': [self.data.loc[idx, 'Quarter'] for idx in outlier_indices],
                'values': [float(self.data.loc[idx, indicator]) for idx in outlier_indices]
            }
        
        return results
    
    def check_consistency(self) -> Dict[str, any]:
        """
        Check mathematical consistency between indicators
        
        Returns:
            Dictionary with consistency check results
        """
        # Employment Rate + Unemployment Rate should approximately equal 100
        er_ur_sum = self.data['ER'] + self.data['UR']
        tolerance = 2.0  # Allow 2% tolerance
        
        inconsistent = abs(er_ur_sum - 100) > tolerance
        
        return {
            'er_ur_consistent': not inconsistent.any(),
            'inconsistent_count': int(inconsistent.sum()),
            'inconsistent_quarters': [
                self.data.loc[idx, 'Quarter'] 
                for idx in self.data[inconsistent].index
            ] if inconsistent.any() else []
        }
    
    def get_validation_report(self) -> str:
        """
        Generate human-readable validation report
        
        Returns:
            Formatted validation report string
        """
        if not self.validation_results:
            self.validate_all()
        
        report = []
        report.append("=" * 60)
        report.append("DATA VALIDATION REPORT")
        report.append("=" * 60)
        report.append("")
        
        # Missing values
        mv = self.validation_results['missing_values']
        report.append(f"Missing Values: {'✓ None' if not mv['has_missing'] else f'✗ {mv[\"total_missing\"]} found'}")
        
        # Data ranges
        dr = self.validation_results['data_ranges']
        report.append(f"Data Ranges: {'✓ All valid' if dr['all_valid'] else '✗ Invalid values found'}")
        
        # Temporal continuity
        tc = self.validation_results['temporal_continuity']
        report.append(f"Temporal Continuity: {'✓ Continuous' if tc['is_continuous'] else f'✗ {tc[\"gaps_found\"]} gaps found'}")
        
        # Outliers
        report.append("\nOutliers Detected:")
        for indicator, info in self.validation_results['outliers'].items():
            report.append(f"  {indicator}: {info['count']} ({info['percentage']:.1f}%)")
        
        # Consistency
        cons = self.validation_results['consistency']
        report.append(f"\nConsistency Check: {'✓ Passed' if cons['er_ur_consistent'] else '✗ Failed'}")
        
        # Overall
        report.append("")
        report.append("=" * 60)
        overall = "✓ VALID" if self.validation_results['overall_valid'] else "✗ ISSUES FOUND"
        report.append(f"Overall Status: {overall}")
        report.append("=" * 60)
        
        return "\n".join(report)
