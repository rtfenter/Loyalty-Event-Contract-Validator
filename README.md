# Loyalty Event Contract Validator  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Loyalty-Event-Contract-Validator/)


### A tiny tool to validate earn, redeem, and tier-update events against a simple loyalty event contract.

This project is part of my **Loyalty Systems Series**, exploring how loyalty systems behave beneath the UI layer — from event definitions to schema drift to partner-specific rules.

The goal of this validator is to provide a small, interactive way to understand how loyalty events are structured — and how easily they can drift:

- Earn events  
- Redeem events  
- Tier updates  
- Partner-specific rules  
- Required fields & allowed shapes  

The prototype is intentionally small and easy to extend.

---

## Features (MVP)

The first version includes:

- Lightweight JSON validation for three loyalty event types  
- Required field checks  
- Field-type validation (string, number, enum)  
- Missing or unexpected field detection  
- Partner-rule placeholders  
- Simple event flow: `Input → Validate → Result`

---

## Demo Screenshot
<img width="2620" height="3010" alt="Screenshot 2025-11-23 at 06-56-10 Loyalty Event Contract Validator" src="https://github.com/user-attachments/assets/21646428-a6cd-4d04-9d1f-63a2200e024c" />



---

## Loyalty Event Contract (Diagram)

```
        +------------------+
        |   Earn Event     |
        +------------------+
        | user_id          |
        | amount_spent     |
        | currency         |
        | partner_id       |
        | tier             |
        | timestamp        |
        +------------------+

        +------------------+
        |  Redeem Event    |
        +------------------+
        | user_id          |
        | points_used      |
        | reward_id        |
        | partner_id       |
        | timestamp        |
        +------------------+

        +------------------+
        | Tier Update      |
        +------------------+
        | user_id          |
        | old_tier         |
        | new_tier         |
        | partner_id       |
        | effective_date   |
        +------------------+
```

This micro-contract is a stripped-down illustration of how loyalty engines expect events to be shaped before they hit the ledger or downstream systems.

---

## Purpose

Loyalty programs look simple on the surface, but real systems require:

- Strong, predictable event contracts  
- Partner-specific overrides  
- Clean earn → redeem → tier workflows  
- Clear separation of facts (spend) vs. rules (tiers)  
- Drift-resistant fields across markets and services  

This validator makes the event contract visible — so you can see how small inconsistencies lead to:

- Incorrect points  
- Wrong partner attribution  
- Misapplied tiers  
- Broken earning logic  
- Downstream ML drift

---

## How This Maps to Real Loyalty Systems

Even though it’s minimal, each part reflects actual production realities:

### Earn Events  
These feed the points ledger. Shape drift (missing amount, incorrect tier, invalid currency) leads to reconciliation failures.

### Redeem Events  
Used for liability tracking and partner payments. Missing reward_id or points_used breaks accounting flows.

### Tier Updates  
Tiers are stateful. Event drift here causes mismatched privileges, wrong multipliers, and inconsistent partner rules.

### Partner Rules  
In real systems, each partner can override earn %, cap, or redemption behavior.  
This prototype includes placeholders for that logic.

### Schema Drift  
If one service sends `"userId"` and another sends `"user_id"`, the system defaults break silently.  
The validator surfaces exactly that kind of drift.

This tool is the smallest possible demonstration of how contracts stabilize loyalty ecosystems.

---

## Part of the Loyalty Systems Series

Main repo:  
https://github.com/rtfenter/loyalty-series

---

## Status

MVP features active.  
Future enhancements may include:

- partner-specific rule definitions  
- versioned event contracts  
- drift comparison across event batches  

---

## Local Use

No installation required.  
To run locally:

1. Clone the repo  
2. Open `index.html` in your browser  

Everything runs client-side.

