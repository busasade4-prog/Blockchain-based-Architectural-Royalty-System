# 🏛️ Blockchain-based Architectural Royalty System

Welcome to a revolutionary way for architects to earn royalties based on real-world building usage! This project uses the Stacks blockchain and Clarity smart contracts to ensure fair, transparent, and automated royalty payments tied to building metrics like occupancy or energy usage.

## ✨ Features

🔐 **Secure Royalty Agreements**: Register architectural designs with immutable contracts.  
📊 **Usage-based Royalties**: Payments calculated based on real-time building usage data (e.g., occupancy, energy).  
💸 **Automated Payouts**: Distribute royalties to architects via STX tokens.  
🔍 **Transparency**: Publicly verifiable agreements and payment records.  
⚖️ **Dispute Resolution**: Handle disputes over usage data or payments.  
🔄 **Dynamic Updates**: Update usage metrics without compromising agreement integrity.  
👥 **Multi-party Support**: Handle projects with multiple architects or stakeholders.  
🚫 **Fraud Prevention**: Prevent unauthorized changes or duplicate claims.

## 🛠 How It Works

**For Architects**  
1. Register your architectural design with a unique hash, project details, and royalty terms.  
2. Link the design to a building's usage metrics (e.g., IoT sensors for occupancy or energy).  
3. Receive automated royalty payments in STX based on verified usage data.  

**For Building Owners/Managers**  
1. Submit usage data (e.g., monthly occupancy rates) via oracles.  
2. Verify royalty calculations and approve payouts.  
3. Resolve disputes if usage data is contested.  

**For Verifiers/Public**  
1. Query the blockchain to verify design ownership, royalty terms, or payment history.  
2. Ensure transparency in how royalties are calculated and distributed.

## 📜 Smart Contracts

This project uses 8 Clarity smart contracts to manage the royalty system:

1. **DesignRegistry**: Registers architectural designs with a unique hash, title, architect details, and royalty terms.  
2. **UsageTracker**: Records building usage data (e.g., occupancy, energy) submitted by trusted oracles.  
3. **RoyaltyCalculator**: Computes royalty amounts based on usage data and predefined terms.  
4. **PaymentDistributor**: Automates STX token payouts to architects and stakeholders.  
5. **StakeholderManager**: Manages multi-party agreements for projects with multiple architects or investors.  
6. **DisputeResolver**: Handles disputes over usage data or royalty calculations.  
7. **VerificationOracle**: Interfaces with external IoT devices or APIs to validate usage data.  
8. **AuditLog**: Maintains an immutable log of all actions for transparency and auditing.

## 🚀 Getting Started

### Prerequisites
- Stacks blockchain account with STX tokens.  
- Clarity development environment (e.g., Clarinet).  
- IoT devices or APIs for building usage data (optional for testing).  

### Installation
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-repo/architectural-royalty-system.git
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Deploy contracts using Clarinet:  
   ```bash
   clarinet deploy
   ```

### Usage
1. **Register a Design**: Call `DesignRegistry::register-design` with the design hash, title, and royalty terms (e.g., 0.5% of building revenue per 100 occupants).  
2. **Submit Usage Data**: Use `VerificationOracle` to push usage metrics (e.g., 80% occupancy).  
3. **Calculate Royalties**: `RoyaltyCalculator` computes payments based on terms and usage.  
4. **Distribute Payments**: `PaymentDistributor` sends STX to architects.  
5. **Verify or Dispute**: Use `AuditLog` to check actions or `DisputeResolver` to contest data.  

## 🧑‍💻 Example Workflow
1. Architect Alice registers a building design with a 1% royalty per occupant.  
2. Building manager Bob submits monthly occupancy data (e.g., 200 occupants).  
3. `RoyaltyCalculator` computes 2 STX owed based on usage and terms.  
4. `PaymentDistributor` sends 2 STX to Alice’s wallet.  
5. Bob verifies the payment on the blockchain using `AuditLog`.  

## 🛡️ Security Features
- **Immutable Records**: Design hashes and royalty terms are stored on-chain.  
- **Oracle Validation**: Usage data is verified by trusted oracles to prevent fraud.  
- **Dispute Mechanism**: Ensures fair resolution of conflicts.  
- **Multi-sig Approvals**: Stakeholder agreements require consensus for changes.  

## 📚 Documentation
- Full contract details in `/contracts/`.
- API reference in `/docs/api.md`.
- Example usage scripts in `/scripts/`.

## 🤝 Contributing
We welcome contributions! Fork the repo, create a branch, and submit a pull request.  

## 📄 License
MIT License. 