import torch
import torch.nn as nn

class CreditClassifier(nn.Module):
    def __init__(self, input_dim):
        super(CreditClassifier, self).__init__()
        
        # Input layer to hidden layer 1
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(0.2)
        
        # Hidden layer 1 to hidden layer 2
        self.fc2 = nn.Linear(64, 32)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(0.2)
        
        # Output layer (2 classes: 0 = No Default, 1 = Default)
        self.fc3 = nn.Linear(32, 2)
        
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.dropout1(x)
        
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.dropout2(x)
        
        # Return raw logits (required by PyTorch CrossEntropyLoss and Opacus)
        x = self.fc3(x)
        return x