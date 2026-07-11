import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from opacus import PrivacyEngine

# Import our existing blueprints
from dataset import load_and_preprocess_data, FinancialDataset
from model import CreditClassifier

def train_secure_model():
    print("Loading financial data...")
    X_train, X_test, y_train, y_test = load_and_preprocess_data()
    
    train_dataset = FinancialDataset(X_train, y_train)
    test_dataset = FinancialDataset(X_test, y_test)
    
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
    
    input_dim = X_train.shape[1]
    model = CreditClassifier(input_dim)
    
    weights = torch.tensor([1.0, 3.5]) 
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # --- ENTER DIFFERENTIAL PRIVACY ---
    print("Initializing Opacus Privacy Engine...")
    privacy_engine = PrivacyEngine()
    
    # This single function call wraps your model, optimizer, and dataloader
    # to automatically calculate clipping and inject noise.
    model, optimizer, train_loader = privacy_engine.make_private(
        module=model,
        optimizer=optimizer,
        data_loader=train_loader,
        noise_multiplier=1.2, # The amount of noise to add
        max_grad_norm=1.0,    # The clipping threshold
    )
    
    epochs = 20
    print(f"Starting secure training for {epochs} epochs (this may be slightly slower than baseline)...")
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            outputs = model(X_batch)
            loss = criterion(outputs, y_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        # Calculate the Privacy Budget spent so far
        epsilon = privacy_engine.get_epsilon(delta=1e-5)
        
        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(train_loader):.4f} | Privacy Budget (ε spent): {epsilon:.2f}")
            
    # --- EVALUATION ---
    print("\nEvaluating secure DP model against unseen test data...")
    model.eval()
    correct = 0
    total = 0
    
    with torch.no_grad():
        for X_batch, y_batch in test_loader:
            outputs = model(X_batch)
            _, predicted = torch.max(outputs.data, 1)
            total += y_batch.size(0)
            correct += (predicted == y_batch).sum().item()
            
    accuracy = 100 * correct / total
    print(f"Secure DP Target Model Accuracy: {accuracy:.2f}%")
    print(f"Final Privacy Guarantee: (ε = {epsilon:.2f}, δ = 1e-5)")
    
    # Save the secure model so the attacker can test it
    # Opacus modifies the model structure slightly, so we save the original underlying module
    torch.save(model._module.state_dict(), "target_model_dp.pth")
    print("Secure model saved as target_model_dp.pth")
    return {"secure_accuracy": accuracy, "epsilon": epsilon}

if __name__ == "__main__":
    train_secure_model()