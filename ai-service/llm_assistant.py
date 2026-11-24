import os
import httpx
from typing import List, Dict, Any

class LLMAssistant:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    async def generate_response(self, message: str, context: str = "", history: List[Dict[str, str]] = None) -> str:
        # If Gemini API key is configured, query Gemini
        if self.gemini_key:
            try:
                system_prompt = (
                    "You are the expert AI Trading Coach and Crypto Analyst for CoinDCX Demo, an educational "
                    "cryptocurrency simulation platform. Always be informative, clear, objective, and supportive. "
                    "Never promise guaranteed financial returns. Emphasize risk management, leverage safety, and "
                    "technical discipline.\n\nUser Context:\n" + context
                )
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": system_prompt + "\n\nUser Question: " + message}]}
                    ]
                }
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text.strip()
            except Exception as e:
                pass

        # Intelligent Fallback Financial NLP Reasoning
        lower = message.lower()
        if "crypto" in lower or "what is" in lower and "coin" in lower:
            return (
                "**Cryptocurrency** is decentralized digital money built on distributed blockchain ledgers. "
                "Unlike traditional fiat currencies, it operates cryptographically without banks or central authorities. "
                "Assets like Bitcoin (BTC) serve as decentralized stores of value, while Ethereum (ETH) powers "
                "smart contracts and decentralized applications."
            )
        elif "futures" in lower or "derivatives" in lower:
            return (
                "**Futures Trading** enables traders to speculate on cryptocurrency price movements without owning the "
                "underlying asset. You can open **Long** positions if you anticipate a price rise, or **Short** positions "
                "if you anticipate a price drop. On CoinDCX Demo, you can test futures strategies with virtual margin."
            )
        elif "leverage" in lower or "margin" in lower:
            return (
                "**Leverage** multiplies your purchasing power. For example, at **10x leverage**, ₹10,000 margin controls "
                "₹1,00,000 of position size. However, leverage also accelerates potential losses—if market movement goes "
                "against your position, you risk approaching your **Liquidation Price**. Always implement Stop-Loss orders!"
            )
        elif "rsi" in lower:
            return (
                "**Relative Strength Index (RSI)** ranges from 0 to 100. Standard interpretations:\n"
                "• **RSI > 70:** Asset is considered *Overbought*; potential price pullback or consolidation.\n"
                "• **RSI < 30:** Asset is considered *Oversold*; potential value bounce or accumulation zone.\n"
                "• **Bullish/Bearish Divergence:** When price makes a higher high but RSI makes a lower high, a trend reversal often follows."
            )
        elif "portfolio" in lower:
            return (
                f"**Your Portfolio Diagnostic:**\n\n{context or 'No live portfolio data detected.'}\n\n"
                "**Applied AI Recommendation:** Maintain balanced diversification across high-liquidity assets (BTC, ETH) "
                "and maintain at least 30-40% cash reserves in INR to capitalize on market drawdowns."
            )
        else:
            return (
                "Welcome to the **CoinDCX AI Assistant**! I am here to help you navigate crypto markets, "
                "understand technical indicators (RSI, MACD, Bollinger Bands), simulate futures strategies, "
                "and analyze your risk exposure on CoinDCX Demo. Feel free to ask about any coin or trading concept!"
            )

llm_assistant = LLMAssistant()
