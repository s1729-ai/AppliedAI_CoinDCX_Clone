import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_technical_indicators(prices: List[float], highs: List[float] = None, lows: List[float] = None) -> Dict[str, Any]:
    if len(prices) < 14:
        return {
            "rsi": 50.0,
            "macd": 0.0,
            "signal": 0.0,
            "sma20": prices[-1] if prices else 0.0,
            "sma50": prices[-1] if prices else 0.0,
            "upper_band": prices[-1] * 1.02 if prices else 0.0,
            "lower_band": prices[-1] * 0.98 if prices else 0.0,
            "sentiment_score": 50,
            "trend": "NEUTRAL"
        }

    s = pd.Series(prices)

    # 1. RSI (14 periods)
    delta = s.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=14, min_periods=14).mean()
    avg_loss = loss.rolling(window=14, min_periods=14).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    latest_rsi = float(round(rsi.iloc[-1], 2)) if not np.isnan(rsi.iloc[-1]) else 50.0

    # 2. Moving Averages
    sma20 = float(round(s.rolling(window=min(20, len(s))).mean().iloc[-1], 2))
    sma50 = float(round(s.rolling(window=min(50, len(s))).mean().iloc[-1], 2))

    # 3. MACD (12, 26, 9)
    ema12 = s.ewm(span=12, adjust=False).mean()
    ema26 = s.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    latest_macd = float(round(macd_line.iloc[-1], 2))
    latest_signal = float(round(signal_line.iloc[-1], 2))

    # 4. Bollinger Bands (20 periods, 2 std dev)
    rolling_std = s.rolling(window=min(20, len(s))).std()
    upper_band = float(round(sma20 + (rolling_std.iloc[-1] * 2), 2))
    lower_band = float(round(sma20 - (rolling_std.iloc[-1] * 2), 2))

    # 5. Support & Resistance levels
    sorted_prices = np.sort(prices)
    support = float(round(np.percentile(sorted_prices, 15), 2))
    resistance = float(round(np.percentile(sorted_prices, 85), 2))

    # 6. Compound Bullish / Bearish Sentiment Score (0 to 100)
    current_price = prices[-1]
    score = 50

    # RSI weight
    if latest_rsi > 70:
        score -= 15  # Overbought exhaustion risk
    elif latest_rsi < 30:
        score += 20  # Oversold accumulation value
    elif latest_rsi > 50:
        score += 10
    else:
        score -= 10

    # MACD momentum weight
    if latest_macd > latest_signal:
        score += 15
    else:
        score -= 15

    # SMA trend weight
    if current_price > sma20:
        score += 10
    else:
        score -= 10

    if sma20 > sma50:
        score += 10
    else:
        score -= 10

    score = int(max(10, min(95, score)))

    trend = "NEUTRAL"
    if score >= 75:
        trend = "STRONG_BULLISH"
    elif score >= 60:
        trend = "BULLISH"
    elif score <= 30:
        trend = "STRONG_BEARISH"
    elif score <= 45:
        trend = "BEARISH"

    return {
        "rsi": latest_rsi,
        "macd": latest_macd,
        "signal": latest_signal,
        "sma20": sma20,
        "sma50": sma50,
        "upper_band": upper_band,
        "lower_band": lower_band,
        "support": support,
        "resistance": resistance,
        "sentiment_score": score,
        "trend": trend,
        "current_price": current_price
    }
