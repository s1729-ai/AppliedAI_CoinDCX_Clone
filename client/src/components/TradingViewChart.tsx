import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import api from '../services/api';

interface TradingViewChartProps {
  symbol: string;
  isFutures?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, isFutures = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState<string>('15m');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1H', value: '1h' },
    { label: '1D', value: '1d' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { color: '#0b0e14' },
        textColor: '#848e9c',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(31, 41, 55, 0.4)' },
        horzLines: { color: 'rgba(31, 41, 55, 0.4)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#374151',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#374151',
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        autoScale: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c076',
      downColor: '#f6465d',
      borderUpColor: '#00c076',
      borderDownColor: '#f6465d',
      wickUpColor: '#00c076',
      wickDownColor: '#f6465d',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch candle data
  useEffect(() => {
    let isMounted = true;
    const fetchCandles = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/markets/candles/${symbol}`, {
          params: { timeframe, count: 90 },
        });

        if (res.data.success && isMounted && candleSeriesRef.current && volumeSeriesRef.current) {
          const rawCandles = res.data.data;
          const formattedCandles: CandlestickData[] = rawCandles.map((c: any) => ({
            time: c.time as Time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));

          const formattedVolumes = rawCandles.map((c: any) => ({
            time: c.time as Time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(0, 192, 118, 0.4)' : 'rgba(246, 70, 93, 0.4)',
          }));

          candleSeriesRef.current.setData(formattedCandles);
          volumeSeriesRef.current.setData(formattedVolumes);
          chartRef.current?.timeScale().fitContent();
        }
      } catch (e) {
        console.error('Error fetching candles:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCandles();
    const interval = setInterval(fetchCandles, 5000); // 5-second chart refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, timeframe]);

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl overflow-hidden flex flex-col">
      {/* Chart Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2937] bg-[#0e121a]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300">Timeframe:</span>
          <div className="flex items-center bg-[#161d2a] p-0.5 rounded-lg border border-gray-800">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                  timeframe === tf.value
                    ? 'bg-[#0052fe] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Feed
          </span>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            TradingView Engine
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[420px]">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0b0e14]/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
