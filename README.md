# 🛡️ AI Privacy Auditing Engine
**Enterprise DP-SGD Verification & Membership Inference Auditing Environment**

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-Target_Model-EE4C2C?logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Microservice-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite_UI-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)

*(Insert a screenshot of your final dashboard here: e.g., `![Dashboard View](docs/dashboard.png)`)*

## 📖 The Problem Statement
In the modern enterprise, deploying Machine Learning models on sensitive tabular data (finance, healthcare) introduces severe compliance and security risks. Standard neural networks are prone to **empirical memorization**—they inadvertently memorize the exact training records used to build them.

Malicious actors can exploit this using **Membership Inference Attacks (MIA)**, analyzing a deployed model's confidence scores to reverse-engineer whether a specific individual's data (e.g., a credit default record) was used in the training set. 

**The Solution:** This project is a containerized, end-to-end Verification Environment. It allows security teams to train target models, simulate Black-Box MIAs to quantify data leakage, and deploy **Differentially Private Stochastic Gradient Descent (DP-SGD)** via Meta's Opacus to mathematically blind the adversary while preserving functional model utility.

---

## 🏗️ System Architecture

This tool is built using a decoupled microservice architecture, allowing for independent scaling of the frontend UI and the heavy machine learning backend.

* **The Engine (Backend):** FastAPI orchestrating PyTorch target models. Integration with IBM/Linux Foundation's **Adversarial Robustness Toolbox (ART)** for red-team auditing, and **Opacus** for cryptographic noise injection.
* **The Command Center (Frontend):** A responsive React (Vite) dashboard styled with Tailwind CSS v4 and Recharts for real-time comparative cryptography telemetry.
* **Orchestration:** Fully containerized via Docker and `docker-compose` for guaranteed cross-platform execution without dependency collisions.

---

## 📊 Benchmark Telemetry (Sample Run)
* **Dataset:** UCI Default of Credit Card Clients (30,000 records)
* **Functional Accuracy Retention:** `81.6%` (Baseline) ➔ `81.2%` (Secure DP) **[-0.4% Delta]**
* **Privacy Budget Implemented:** `ε = 0.95`, `δ = 1e-5`
* **Vulnerability Footprint:** Adversary success reduced from `78.5%` to **`52.6%`** *(near random guessing)*.

---

## 🏢 Organization Deployment Guide

This environment is containerized for seamless integration into enterprise CI/CD pipelines or local security analyst machines. It requires zero local Python or Node environment setup.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Step 1: Spin Up the Infrastructure
Clone the repository and execute the orchestrator from the root directory:
```bash
git clone [https://github.com/yourusername/ai-privacy-auditing-engine.git](https://github.com/yourusername/ai-privacy-auditing-engine.git)
cd ai-privacy-auditing-engine
docker compose up --build
```
The daemon will automatically pull the necessary Alpine Linux images, compile the React dist, and configure the PyTorch environment.

### Step 2: Access the Command Center
Once the containers are live, navigate to http://localhost in your web browser to access the Privacy Engine Control Center.

### Step 3: Execute the Audit Pipeline
Compile Baseline: Click this to train an unregularized Multi-Layer Perceptron. Watch the console stream as the API saves the vulnerable .pth weights.
Inject DP-SGD: Click this to train the shadow secure model. The backend will inject clipping routines and noise multipliers into the backward training loop.
Run Membership Leak Audit: With both models saved, trigger the MIA. The UI will extract the telemetry and render the success bounds, proving the efficacy of the differential privacy implementation.
