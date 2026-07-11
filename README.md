# 🛡️ AI Privacy Auditing Engine
**Enterprise DP-SGD Verification & Membership Inference Auditing Environment**

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-Target_Model-EE4C2C?logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Microservice-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite_UI-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)



---

## 📖 The Problem Statement

In the modern enterprise, deploying Machine Learning models on sensitive tabular data (finance, healthcare) introduces severe compliance and security risks. Standard neural networks are prone to **empirical memorization** — they inadvertently memorize the exact training records used to build them.

Malicious actors can exploit this using **Membership Inference Attacks (MIA)**, analyzing a deployed model's confidence scores to reverse-engineer whether a specific individual's data (e.g., a credit default record) was used in the training set.

**The Solution:** This project is a containerized, end-to-end verification environment. It allows security teams to train target models, simulate black-box MIAs to quantify data leakage, and deploy **Differentially Private Stochastic Gradient Descent (DP-SGD)** to mathematically bound the adversary's advantage while preserving functional model utility.

---

## 🏗️ System Architecture & Tech Stack Rationale

This tool is built using a decoupled microservice architecture, allowing for independent scaling of the frontend UI and the heavy machine learning backend.

* **Backend Engine (FastAPI & PyTorch):** FastAPI was selected for its native async capabilities, crucial for orchestrating long-running ML training jobs without blocking the event loop. PyTorch was chosen as the ML framework because Meta's Opacus is natively optimized for its dynamic computational graph.
* **Security Subsystems (ART & Opacus):** IBM/Linux Foundation's **Adversarial Robustness Toolbox (ART)** powers the red-team auditing, and **Opacus** manages the gradient clipping and calibrated noise injection.
* **Frontend Command Center (React/Vite):** A responsive dashboard styled with Tailwind CSS v4 and Recharts. Decoupled from the backend so heavy matrix multiplications don't degrade UI thread performance.
* **Orchestration (Docker):** Fully containerized via `docker-compose` to guarantee cross-platform execution and eliminate dependency collisions in enterprise CI/CD environments.

---

## 📂 Repository Structure

```text
.
├── api.py                     # FastAPI gateway and endpoint definitions
├── main.py                    # Standard Multi-Layer Perceptron (MLP) pipeline
├── train_dp.py                # Opacus DP-SGD secured training pipeline
├── attack.py                  # ART Membership Inference logic and shadow models
├── dataset.py                 # Data loading, scaling, and preprocessing
├── Dockerfile                 # Backend Python/PyTorch container configuration
├── docker-compose.yml         # Multi-container orchestration
├── requirements.txt           # Python dependency tree
└── privacy-dashboard/         # React/Vite Frontend
    ├── src/                   # Dashboard components and Axios API logic
    ├── Dockerfile              # Multi-stage frontend container (Node -> Nginx)
    └── package.json            # UI dependencies
```

---

## 🔌 Core API Endpoints

The FastAPI backend exposes the following REST endpoints to interface with the ML pipelines:

### `POST /api/train/baseline`
- **Action:** Triggers the unregularized MLP training loop on 30,000 records.
- **Response:** Returns functional accuracy metrics and saves the vulnerable `.pth` weights.

### `POST /api/train/secure`
- **Action:** Wraps the model in the Opacus Privacy Engine, computes per-sample gradients, clips them, and injects calibrated noise.
- **Response:** Returns secure accuracy and the mathematically guaranteed privacy budget (ε).

### `POST /api/audit/attack`
- **Action:** Trains ART shadow models to exploit logit confidence disparities between the target models.
- **Response:** Returns classification metrics for the adversary's success bounds.

---

## 🧠 Design Decisions & Tradeoffs

**Why an MLP instead of Gradient Boosting (e.g., XGBoost)?**
While tree-based models often perform exceptionally well on tabular data, applying strict, mathematically provable differential privacy to decision trees is computationally inefficient and complex. PyTorch MLPs allow for elegant, per-sample gradient clipping (DP-SGD), making them the standard choice in DP research.

**Why black-box MIA specifically?**
A black-box threat model was chosen to simulate the most realistic enterprise attack vector. The adversary does not have access to the model's internal weights or architecture — only API access to the final confidence probabilities (logits), which closely represents a compromised public-facing API.

**The privacy-utility tradeoff (ε = 0.95):**
The DP-SGD noise multiplier was tuned to achieve ε < 1.0, a threshold widely treated as a strong privacy guarantee in the DP literature. This setting degraded the attacker's success rate to near-random guessing (~52.6%) while sacrificing only 0.4% of functional predictive accuracy — the target operating point for enterprise deployment.

---

## 📊 Benchmark Telemetry (Sample Run)

* **Dataset:** UCI Default of Credit Card Clients (30,000 records)
* **Functional Accuracy Retention:** `81.6%` (Baseline) ➔ `81.2%` (Secure DP) **[-0.4% delta]**
* **Privacy Budget Implemented:** `ε = 0.95`, `δ = 1e-5`
* **Vulnerability Footprint:** Adversary (MIA) success rate reduced from `78.5%` to **`52.6%`** *(near random guessing, where 50% = no adversary advantage)*

> Note: results are from a single sample run on the UCI dataset with a fixed seed. Reported numbers will vary with noise multiplier, clipping norm, batch size, and epoch count.

---

## 🏢 Organization Deployment Guide

This environment is containerized for seamless integration into enterprise CI/CD pipelines or local security analyst machines. It requires zero local Python or Node environment setup.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Step 1: Spin Up the Infrastructure
Clone the repository and execute the orchestrator from the root directory:
```bash
git clone https://github.com/yourusername/ai-privacy-auditing-engine.git
cd ai-privacy-auditing-engine
docker compose up --build
```
The daemon will automatically pull the necessary Alpine Linux images, compile the React dist, and configure the PyTorch environment.

### Step 2: Access the Command Center
Once the containers are live, navigate to `http://localhost` in your web browser to access the Privacy Engine Control Center.

### Step 3: Execute the Audit Pipeline
1. **Compile Baseline:** Train the vulnerable target classifier.
2. **Inject DP-SGD:** Train the secondary, mathematically private model.
3. **Run Membership Leak Audit:** Execute the ART pipeline to extract vulnerability telemetry and render the success bounds.

---

## 🚀 Future Work

* **White-Box Inference Attacks:** Extend the ART pipeline to simulate insider-threat scenarios where the adversary has access to internal model weights.
* **Rényi Differential Privacy (RDP):** Implement the RDP accountant for tighter, more precise privacy-budget tracking over large epoch counts.
* **Federated Learning Integration:** Decouple the data loader to simulate DP-SGD training across distributed, edge-device nodes without centralizing raw data.

---

## 🙏 Acknowledgments

This architecture relies on pioneering open-source research tooling:
* [Adversarial Robustness Toolbox (ART)](https://github.com/Trusted-AI/adversarial-robustness-toolbox) by the Trusted-AI community and the Linux Foundation, for standardizing evasion and inference audits.
* [Opacus](https://opacus.ai/) by Meta Research, for making production-grade DP-SGD accessible in native PyTorch.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
