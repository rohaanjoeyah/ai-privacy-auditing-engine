import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from ucimlrepo import fetch_ucirepo

class FinancialDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

def load_and_preprocess_data():
    print("Connecting to UCI Machine Learning Repository...")
    
    # Fetch the dataset directly using its official UCI ID (350)
    dataset = fetch_ucirepo(id=350)
    
    # Extract features (X) and targets (y) as pandas DataFrames
    X_df = dataset.data.features
    y_df = dataset.data.targets
    
    # Convert to NumPy arrays for scikit-learn
    X = X_df.values
    
    # The target column is named 'default payment next month'
    # .ravel() flattens it from a 2D column to a 1D array, which PyTorch requires
    y = y_df.values.ravel()
    
    print(f"Successfully loaded {len(X)} financial records.")
    
    # Split into Train and Test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    # Scale financial amounts
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    return X_train, X_test, y_train, y_test