import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Import the blueprints we just created
from dataset import load_and_preprocess_data, FinancialDataset
from model import CreditClassifier

def train_baseline_model():
    print("Fetching and preprocessing financial data (this may take a few seconds)...")
    X_train, X_test, y_train, y_test = load_and_preprocess_data()
    
    # Wrap data in PyTorch Datasets
    train_dataset = FinancialDataset(X_train, y_train)
    test_dataset = FinancialDataset(X_test, y_test)
    
    # DataLoaders handle batching (feeding 64 records at a time) and shuffling
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
    
    # Initialize the model dynamically based on the number of financial features
    input_dim = X_train.shape[1]
    model = CreditClassifier(input_dim)

    weights = torch.tensor([1.0, 3.5]) 
    criterion = nn.CrossEntropyLoss(weight=weights)
    
    # Define the Loss Function and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 20
    print(f"Starting training for {epochs} epochs...")
    
    # --- THE TRAINING LOOP ---
    for epoch in range(epochs):
        model.train() # Sets model to training mode (enables Dropout for security)
        total_loss = 0
        
        for X_batch, y_batch in train_loader:
            # 1. Clear old mathematical gradients
            optimizer.zero_grad()
            
            # 2. Forward Pass: Make predictions
            outputs = model(X_batch)
            
            # 3. Calculate Loss: How far off were the predictions?
            loss = criterion(outputs, y_batch)
            
            # 4. Backward Pass: Autograd calculates the exact weight adjustments needed
            loss.backward()
            
            # 5. Optimize: Apply the adjustments to the model's parameters
            optimizer.step()
            
            total_loss += loss.item()
            
        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(train_loader):.4f}")
            
    # --- EVALUATION ---
    print("\nEvaluating baseline model against unseen test data...")
    model.eval() # Sets model to eval mode (disables Dropout for accurate testing)
    correct = 0
    total = 0
    
    # torch.no_grad() tells PyTorch to stop tracking gradients, saving memory/speed
    with torch.no_grad():
        for X_batch, y_batch in test_loader:
            outputs = model(X_batch)
            # Find the index with the highest probability (0: No Default, 1: Default)
            _, predicted = torch.max(outputs.data, 1)
            total += y_batch.size(0)
            correct += (predicted == y_batch).sum().item()
            
    accuracy = 100 * correct / total
    print(f"Baseline Target Model Accuracy: {accuracy:.2f}%")
    
    # Save the trained weights to disk so the attacker can target it later
    torch.save(model.state_dict(), "target_model_baseline.pth")
    print("Model saved as target_model_baseline.pth")
    return {"baseline_accuracy": accuracy}

if __name__ == "__main__":
    train_baseline_model()