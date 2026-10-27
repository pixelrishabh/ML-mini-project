"""
preprocessing_module.py (root wrapper)
Exposes preprocessing functions from model.preprocessing_module.
"""
from model.preprocessing_module import (
    load_data,
    handle_missing_values,
    encode_categoricals,
    clean_duplicates,
    split_features_target,
    load_and_preprocess,
    DEFAULT_DATA_PATH
)

if __name__ == "__main__":
    X, y = load_and_preprocess()
    print("[Root Preprocessing Demo] Preprocessed X shape:", X.shape, "y shape:", y.shape)
