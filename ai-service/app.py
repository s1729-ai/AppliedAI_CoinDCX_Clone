import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from technical_analysis import calculate_technical_indicators
from llm_assistant import llm_assistant
from trade_evaluator import trade_evaluator

load_dotenv()

app = FastAPI(
    title="CoinDCX Demo - Applied AI Microservice",
    description="FastAPI service for technical indicators, AI market analyst, coin analyzer, and trade review",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeCoinRequest(BaseModel):
    symbol: str
    prices: Optional[List[float]] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    context: Optional[str] = ""

class TradeReviewRequest(BaseModel):
    orders: Optional[List[Dict[str, Any]]] = []
    positions: Optional[List[Dict[str, Any]]] = []

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "CoinDCX Demo AI Microservice",
        "version": "1.0.0"
    }

@app.get("/ai/market-analysis")
def market_analysis():
    # Sample multi-coin analysis
    coins = [
        {"symbol": "BTC", "name": "Bitcoin", "base_price": 8345200, "change": 3.42},
        {"symbol": "ETH", "name": "Ethereum", "base_price": 312450, "change": 4.15},
        {"symbol": "SOL", "name": "Solana", "base_price": 19850, "change": 7.82},
        {"symbol": "XRP", "name": "XRP", "base_price": 194.5, "change": 12.4},
        {"symbol": "BNB", "name": "BNB", "base_price": 58240, "change": -0.85},
        {"symbol": "DOGE", "name": "Dogecoin", "base_price": 34.2, "change": -2.15},
    ]

    results = []
    for c in coins:
        p = c["base_price"]
        # Generate representative recent close prices
        sim_prices = [p * (1 + (i - 30) * 0.0015 + ((i % 5) - 2) * 0.002) for i in range(35)]
        sim_prices.append(p)
        ind = calculate_technical_indicators(sim_prices)

        results.append({
            "symbol": c["symbol"],
            "name": c["name"],
            "price": p,
            "change24h": c["change"],
            "rsi": ind["rsi"],
            "macd": ind["macd"],
            "signal": ind["signal"],
            "sma20": ind["sma20"],
            "sma50": ind["sma50"],
            "score": ind["sentiment_score"],
            "signalType": ind["trend"],
            "summary": f"{c['name']} shows a {ind['trend'].replace('_', ' ')} trajectory with RSI at {ind['rsi']}. Immediate support at ₹{ind['support']:,.2f}."
        })

    return {
        "success": True,
        "marketSentiment": "Greed (Bullish Bias)",
        "fearGreedIndex": 68,
        "data": results
    }

@app.post("/ai/analyze-coin")
def analyze_coin(req: AnalyzeCoinRequest):
    symbol = req.symbol.upper()
    prices = req.prices
    if not prices or len(prices) < 10:
        base = 8345000 if symbol == "BTC" else 312000 if symbol == "ETH" else 19800 if symbol == "SOL" else 1000
        prices = [base * (1 + (i - 25) * 0.002 + ((i % 4) - 2) * 0.003) for i in range(30)]

    ind = calculate_technical_indicators(prices)
    volatility = float(round((np.std(prices) / np.mean(prices)) * 100, 2))
    risk_level = "VERY_HIGH" if volatility > 5 else "HIGH" if volatility > 3 else "MODERATE"

    return {
        "success": True,
        "data": {
            "symbol": symbol,
            "price": ind["current_price"],
            "technicalIndicators": ind,
            "metrics": {
                "sentimentScore": ind["sentiment_score"],
                "volatility": volatility,
                "riskLevel": risk_level,
                "trendDirection": "BULLISH" if ind["sentiment_score"] >= 50 else "BEARISH"
            },
            "aiSummary": f"{symbol} technical model displays {ind['trend']} bias. RSI={ind['rsi']} indicates balanced momentum. Key resistance: {ind['resistance']}.",
            "recommendation": "Maintain defined risk parameters and adhere to stop-loss guidelines."
        }
    }

@app.post("/ai/chat")
async def chat(req: ChatRequest):
    reply = await llm_assistant.generate_response(req.message, req.context, req.history)
    return {"success": True, "reply": reply}

@app.post("/ai/trade-review")
def review_trades(req: TradeReviewRequest):
    eval_result = trade_evaluator.evaluate_trades(req.orders or [], req.positions or [])
    return {"success": True, "data": eval_result}
