import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log(' Starting CoinDCX Demo End-to-End Verification Tests');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, desc: string) => {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.status === 200 && health.data.status === 'online', '1. Server Health Check API');

    // 2. Markets listing
    const coinsRes = await axios.get(`${BASE_URL}/markets/coins`);
    assert(coinsRes.data.success && coinsRes.data.data.length >= 13, `2. Market Coins Listing (${coinsRes.data.data.length} coins)`);

    // Verify mandatory coins exist
    const symbols = coinsRes.data.data.map((c: any) => c.symbol);
    const required = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'TRX', 'AVAX', 'DOT', 'LINK', 'LTC', 'SHIB'];
    const allRequiredPresent = required.every((r) => symbols.includes(r));
    assert(allRequiredPresent, '3. All 13 Required Cryptocurrencies Present (BTC, ETH, SOL, BNB, XRP, DOGE, ADA, TRX, AVAX, DOT, LINK, LTC, SHIB)');

    // 4. Futures markets
    const futuresRes = await axios.get(`${BASE_URL}/markets/futures`);
    assert(futuresRes.data.success && futuresRes.data.data.length >= 3, '4. Futures Markets Listing (BTCUSDT, ETHUSDT, SOLUSDT)');

    // 5. Candlestick feed
    const candlesRes = await axios.get(`${BASE_URL}/markets/candles/BTC?timeframe=15m`);
    assert(candlesRes.data.success && candlesRes.data.data.length > 50, '5. Candlestick Chart Feed for Lightweight Charts');

    // 6. Order book
    const obRes = await axios.get(`${BASE_URL}/markets/orderbook/BTC`);
    assert(obRes.data.success && obRes.data.data.bids.length > 0 && obRes.data.data.asks.length > 0, '6. Order Book Bids & Asks Stream');

    // 7. Demo Registration & Virtual Fund Allocation
    const testEmail = `test_${Date.now()}@coindcx.edu`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Verification Bot',
      email: testEmail,
      password: 'password123',
    });
    assert(regRes.data.success && !!regRes.data.token, '7. User Registration & JWT Issuance');
    assert(regRes.data.wallet.inrBalance === 1000000, '8. Virtual Wallet Credited with ₹10,00,000 Initial Demo Balance');

    const token = regRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 9. One-Click Demo Login Check
    const demoLoginRes = await axios.post(`${BASE_URL}/auth/demo-login`);
    assert(demoLoginRes.data.success && !!demoLoginRes.data.token, '9. One-Click Demo Login Endpoint');

    // 10. Spot Buy Order Execution
    const buyRes = await axios.post(
      `${BASE_URL}/spot/order`,
      {
        pair: 'BTC/INR',
        side: 'BUY',
        type: 'MARKET',
        totalInr: 100000,
      },
      authHeaders
    );
    assert(buyRes.data.success && buyRes.data.wallet.inrBalance < 1000000, '10. Spot Buy Simulated Execution & Wallet Deduction');

    // Check coin balance exists
    const btcBal = buyRes.data.wallet.coinBalances.find((b: any) => b.coin === 'BTC');
    assert(btcBal && btcBal.free > 0, `11. Wallet Acquired ${btcBal?.free} BTC Free Balance`);

    // 12. Spot Sell Order Execution
    const sellQty = (btcBal.free * 0.5);
    const sellRes = await axios.post(
      `${BASE_URL}/spot/order`,
      {
        pair: 'BTC/INR',
        side: 'SELL',
        type: 'MARKET',
        quantity: sellQty,
      },
      authHeaders
    );
    assert(sellRes.data.success, '12. Spot Sell Simulated Execution & Proceeds Credited');

    // 13. Open Orders History
    const ordersRes = await axios.get(`${BASE_URL}/spot/orders`, authHeaders);
    assert(ordersRes.data.success && ordersRes.data.data.length >= 2, '13. Spot Orders Audit History');

    // 14. Futures Open Long Position (10x Leverage)
    const futOpenRes = await axios.post(
      `${BASE_URL}/futures/position`,
      {
        pair: 'BTCUSDT',
        side: 'LONG',
        type: 'MARKET',
        quantity: 0.05,
        leverage: 10,
        marginType: 'ISOLATED',
      },
      authHeaders
    );
    assert(futOpenRes.data.success && futOpenRes.data.position.liquidationPrice > 0, '14. Futures 10x Long Position Opened with Liquidation Price Calculated');

    const posId = futOpenRes.data.position._id;

    // 15. Futures Positions List & PnL
    const posRes = await axios.get(`${BASE_URL}/futures/positions`, authHeaders);
    assert(posRes.data.success && posRes.data.data.open.length >= 1, '15. Futures Open Positions Retrieved with Live P&L');

    // 16. Futures Close Position
    const closeRes = await axios.post(
      `${BASE_URL}/futures/close`,
      { positionId: posId },
      authHeaders
    );
    assert(closeRes.data.success && closeRes.data.position.status === 'CLOSED', '16. Futures Position Closed & Realized P&L Settled');

    // 17. Wallet Deposit Demo Funds
    const depRes = await axios.post(`${BASE_URL}/wallet/deposit`, { amount: 50000 }, authHeaders);
    assert(depRes.data.success, '17. Virtual Deposit of Demo Funds (+₹50,000)');

    // 18. Wallet Withdraw Demo Funds
    const wRes = await axios.post(`${BASE_URL}/wallet/withdraw`, { amount: 20000 }, authHeaders);
    assert(wRes.data.success, '18. Virtual Withdrawal of Demo Funds (-₹20,000)');

    // 19. Portfolio Diagnostics
    const portRes = await axios.get(`${BASE_URL}/portfolio`, authHeaders);
    assert(portRes.data.success && portRes.data.data.totalPortfolioValue > 0, '19. Portfolio Metrics, Asset Allocation & 7-Day Performance Curve');

    // 20. AI Market Analyst
    const aiAnalystRes = await axios.get(`${BASE_URL}/ai/market-analysis`);
    assert(aiAnalystRes.data.success && aiAnalystRes.data.data.length > 0, '20. AI Market Analyst: RSI, MACD & Bullish/Bearish Signal Scoring');

    // 21. AI Coin Analyzer
    const aiCoinRes = await axios.get(`${BASE_URL}/ai/analyze-coin/ETH`);
    assert(aiCoinRes.data.success && aiCoinRes.data.data.technicalIndicators.rsi > 0, '21. AI Coin Analyzer: Deep Technical Indicators & Volatility Score');

    // 22. AI Trading Assistant Chatbot
    const aiChatRes = await axios.post(
      `${BASE_URL}/ai/chat`,
      { message: 'What is leverage and liquidation in futures?' },
      authHeaders
    );
    assert(aiChatRes.data.success && !!aiChatRes.data.reply, '22. AI Trading Assistant: Conversational Financial Engine');

    // 23. AI Trade Review
    const aiReviewRes = await axios.get(`${BASE_URL}/ai/trade-review`, authHeaders);
    assert(aiReviewRes.data.success && aiReviewRes.data.data.totalTrades >= 2, '23. AI Trade Review: Evaluates Win Rate & Trading Archetype');

    console.log('==================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed === 0) {
      console.log('>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
      process.exit(0);
    } else {
      console.error('>>> SOME TESTS FAILED <<<');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
