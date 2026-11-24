# CoinDCX Demo — Cryptocurrency Exchange & AI Trading Terminal

> **Academic Project Notice:**
> This repository contains an independent educational simulation built for a **B.Tech Applied AI Project**.
> It replicates the visual identity, navigation, page structures, spot trading terminal, futures trading with leverage, virtual wallet, and portfolio management of **CoinDCX** (https://coindcx.com/), branded as **"CoinDCX Demo"**.
> All funds, balances, and orders are 100% virtual and simulated. No real fiat currency or cryptocurrency is transacted.

---

## 🚀 Key Features

### 1. CoinDCX UI/UX Replication
- **Branded Design Language:** Obsidian dark theme (`#0b0e14`, `#121824`), signature CoinDCX Royal Blue (`#0052fe`), Gain Green (`#00c076`), and Loss Red (`#f6465d`).
- **Complete Route Architecture:**
  - `/` — Homepage with Hero, live price ticker cards, top cryptocurrencies table, product showcase, trust pillars, and FAQ.
  - `/markets` — Comprehensive market listing of all 13 required coins with sorting, search, filtering, watchlist, and details modal.
  - `/trade/spot` — High-performance Spot Trading terminal with TradingView candlestick charts, live order book, recent trades stream, percentage sliders (25%, 50%, 75%, 100%), fee calculation (0.1%), and order history.
  - `/trade/futures` — Futures Trading terminal supporting **BTCUSDT**, **ETHUSDT**, **SOLUSDT** with up to **50x Leverage**, Cross & Isolated margin, Long & Short orders, Take Profit / Stop Loss, estimated liquidation price, open positions with live unrealized P&L, and one-click market close.
  - `/wallet` — Virtual Demo Wallet starting with **₹10,00,000 virtual INR**, one-click demo deposits (+₹50k, +₹1L), withdrawals, internal transfers, and full ledger.
  - `/portfolio` — Total portfolio investment, current value, total P&L, daily P&L, asset allocation donut chart, 7-day performance trajectory curve, and individual coin holdings.
  - `/orders` — Unified view of Spot orders, Open futures positions, and Closed trade history.
  - `/history` — Comprehensive audit ledger of all virtual deposits, withdrawals, and trade settlements.
  - `/ai-assistant` — Full Applied AI Suite (Market Analyst, Coin Analyzer, Trading Coach Chatbot, and Trade Review).
  - `/profile` — KYC Verified Demo badge, limits, security settings, and demo account parameters.
  - `/settings` — Order confirmation toggles, default leverage presets, and notification preferences.
  - `/login` & `/register` — Authentication with **One-Click Instant Demo Access**.

### 2. Supported Cryptocurrencies (13 Required Coins)
- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **SOL** (Solana)
- **BNB** (BNB)
- **XRP** (Ripple)
- **DOGE** (Dogecoin)
- **ADA** (Cardano)
- **TRX** (Tron)
- **AVAX** (Avalanche)
- **DOT** (Polkadot)
- **LINK** (Chainlink)
- **LTC** (Litecoin)
- **SHIB** (Shiba Inu)

---

## 🤖 Applied AI Features

### A. AI Market Analyst
- Computes real-time **RSI (14-period)**, **MACD (12, 26, 9)**, **SMA-20**, **SMA-50**, and **Bollinger Bands**.
- Computes a composite **Bullish / Bearish Sentiment Score (0 to 100)** and categorizes assets into `STRONG_BUY`, `BUY`, `NEUTRAL`, `SELL`, or `STRONG_SELL`.

### B. AI Coin Analyzer
- Inspect any coin on-demand for immediate support, key resistance levels, standard deviation volatility percentage, and risk ratings (`LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`).

### C. AI Trading Assistant (Conversational Chatbot)
- Context-aware chatbot equipped with real-time portfolio data and crypto market expertise.
- Answers queries about leverage, liquidation, RSI interpretation, MACD crossovers, and personalized portfolio health.
- Features one-click prompt chips for rapid interaction.
- Powered by Google Gemini / OpenAI LLM API integration with a built-in statistical NLP fallback engine.

### D. AI Trade Review
- Analyzes simulated spot and futures trade history using Pandas and Scikit-Learn logic.
- Evaluates **Win Rate (%)**, **Profit Factor**, **Risk Exposure**, and assigns a trading archetype (e.g. *Disciplined Trend Follower* vs. *High-Risk Speculative Scalper*).
- Formulates actionable risk-management recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, TradingView Lightweight Charts |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB Atlas / Mongoose (with automated in-memory / local persistent JSON fallback for zero-config evaluation) |
| **AI Microservice** | Python 3.11, FastAPI, Uvicorn, Pandas, NumPy, Scikit-Learn, HTTPX, Pydantic |

---

## 📁 Repository Structure

```
Applied AI Project/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # TradingViewChart, OrderBook, SpotOrderPanel, FuturesOrderPanel, Navbar, Footer, etc.
│   │   ├── context/            # AuthContext, MarketContext, WalletContext
│   │   ├── pages/              # Home, Markets, Spot, Futures, Wallet, Portfolio, AIAssistant, etc.
│   │   ├── services/           # Axios API service
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # INR formatters, P&L calculations
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/        # auth, market, spot, futures, wallet, portfolio, ai
│   │   ├── middleware/         # JWT authentication
│   │   ├── models/             # User, Wallet, Coin, Transaction, Order, FuturesPosition, Watchlist, etc.
│   │   ├── services/           # CoinDCX live market data service & candlestick generator
│   │   ├── db.ts               # Mongoose database connector
│   │   └── index.ts            # Server entry point
│   └── test-e2e.ts             # 23-step automated end-to-end test suite
├── ai-service/                 # FastAPI Applied AI Microservice
│   ├── app.py                  # FastAPI app endpoints
│   ├── technical_analysis.py   # RSI, MACD, Bollinger Bands, ATR, Bullish/Bearish scoring
│   ├── llm_assistant.py        # LLM integration (Gemini / OpenAI / Statistical NLP)
│   └── trade_evaluator.py      # Scikit-learn trade evaluator & win-rate diagnostic
├── .env.example                # Sample environment variables
└── README.md                   # Project documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- npm or pnpm

### 1. Installation
Install dependencies for all tiers:
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install

# Python AI Service dependencies (optional, as Node backend also has built-in AI analytics fallback)
cd ../ai-service
pip install -r requirements.txt
```

### 2. Environment Setup
Copy `.env.example` to `server/.env` and `ai-service/.env`:
```bash
# Server
cp .env.example server/.env

# AI Service (Optional - add GEMINI_API_KEY if desired)
cp ai-service/.env.example ai-service/.env
```

### 3. Run the Application
In separate terminal windows:

**Terminal 1 — Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```

**Terminal 3 — Python AI Service (Port 8000, Optional):**
```bash
cd ai-service
python -m uvicorn app:app --reload --port 8000
```

Open your browser at **http://localhost:5173**.

---

## 🔑 Demo Login Account

- **Instant Demo:** Click the **"⚡ One-Click Instant Demo Login"** button on the login page or in the navbar.
- **Manual Credentials:**
  - **Email:** `demo@coindcx.edu`
  - **Password:** `coindcx123`
- **Initial Virtual Funds:** `₹10,00,000` preloaded demo INR.

---

## 🧪 Verification & Automated Testing

To run the automated 23-point test suite verifying all routes, database operations, trading executions, and AI endpoints:
```bash
cd server
npm run build
npx ts-node test-e2e.ts
```

All 23 test assertions pass with zero failures.

---

## 📜 Academic Disclaimer
This software is strictly intended for educational and academic research as part of a **B.Tech Applied AI Project**. It is not affiliated with, authorized, or endorsed by CoinDCX (Neblio Technologies Pvt. Ltd.).
