import torch
import torch.nn as nn
import numpy as np  # Added for data type conversion
from dataset import load_and_preprocess_data
from model import CreditClassifier

# Import ART components
from art.estimators.classification import PyTorchClassifier
from art.attacks.inference.membership_inference import MembershipInferenceBlackBox

def run_privacy_attack():
    print("Loading data and target model...")
    # 1. Load the exact same data
    X_train, X_test, y_train, y_test = load_and_preprocess_data()
    
    # 2. Load the trained target model we saved earlier
    input_dim = X_train.shape[1]
    model = CreditClassifier(input_dim)
    model.load_state_dict(torch.load("target_model_dp.pth"))
    model.eval() # The model must be in evaluation mode during an attack
    
    # 3. Wrap the native PyTorch model into an ART Classifier
    criterion = nn.CrossEntropyLoss()
    classifier = PyTorchClassifier(
        model=model,
        loss=criterion,
        optimizer=None, # The attacker isn't optimizing the target, just querying it
        input_shape=(input_dim,),
        nb_classes=2,
    )
    
    # 4. Initialize the Attacker (Black Box Membership Inference)
    print("Training the Attack Model (this simulates the adversary analyzing confidence scores)...")
    attack = MembershipInferenceBlackBox(classifier)
    
    # Fix: Cast the NumPy arrays to float32 explicitly using .astype(np.float32)
    X_train_slice = X_train[:1000].astype(np.float32)
    X_test_slice = X_test[:1000].astype(np.float32)
    
    attack.fit(X_train_slice, y_train[:1000], X_test_slice, y_test[:1000])
    
    # 5. Execute the Attack
    print("Executing the attack against the target model...")
    
    # Fix: Cast here as well
    inferred_train = attack.infer(X_train_slice, y_train[:1000])
    inferred_test = attack.infer(X_test_slice, y_test[:1000])
    
    # Calculate Attacker Success (1 means 'Member', 0 means 'Non-Member')
    inferred_train = inferred_train.ravel()
    inferred_test = inferred_test.ravel()
    
    # Train accuracy: what % of actual members did the attacker correctly guess as 1 (Member)?
    train_accuracy = np.mean(inferred_train == 1)
    
    # Test accuracy: what % of actual non-members did the attacker correctly guess as 0 (Non-Member)?
    test_accuracy = np.mean(inferred_test == 0)
    
    overall_attack_accuracy = (train_accuracy + test_accuracy) / 2
    
    print(f"\n--- ATTACK RESULTS ---")
    print(f"Attacker identified training members: {train_accuracy * 100:.2f}% of the time.")
    print(f"Attacker identified non-members: {test_accuracy * 100:.2f}% of the time.")
    print(f"Overall Attack Success Rate: {overall_attack_accuracy * 100:.2f}%")
    print(f"(Note: A random guess is 50%. Anything higher indicates a privacy leak.)")
    return {
        "train_accuracy": train_accuracy * 100,
        "test_accuracy": test_accuracy * 100,
        "overall_attack_success": overall_attack_accuracy * 100
    }

if __name__ == "__main__":
    run_privacy_attack()