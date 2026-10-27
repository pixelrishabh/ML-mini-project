"""
testing_module.py (model subpackage)
Delegates to root testing module for consistent logic.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from testing_module import (
    get_models,
    run_model_comparison
)
from preprocessing_module import load_and_preprocess

if __name__ == "__main__":
    X, y = load_and_preprocess()
    results_df, best_name, models = run_model_comparison(X, y)
    print("Best Model:", best_name)
