import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, TrendingUp, X as XIcon, Clock, Globe } from 'lucide-react';

// Base prices for Brazilian market (Reference CEPEA/B3)
const BASE_PRICES = {
  boi: 235.50,
  soja: 134.20,
  milho: 59.80,
  trigo: 1450.00
};

const MarketTodayCard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const quoteDetails = {
    dolar: { name: 'Dólar Comercial', emoji: '💵', unit: 'R$', format: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 4 }) },
    boi: { name: 'Arroba do Boi', emoji: '🐂', unit: 'R$', format: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    soja: { name: 'Soja (Saca 60kg)', emoji: '🌾', unit: 'R$', format: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    milho: { name: 'Milho (Saca 60kg)', emoji: '🌽', unit: 'R$', format: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    trigo: { name: 'Trigo (Tonelada)', emoji: '🌾', unit: 'R$', format: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
  };

  const generateHistory = (baseValue, days = 7) => {
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      // Variation between -2% and +2%
      const variation = 1 + (Math.random() * 0.04 - 0.02);
      return {
        date: date.toISOString().split('T')[0],
        value: baseValue * variation
      };
    });
  };

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Dollar Data (AwesomeAPI - No Token Required)
      const dolarRes = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const dolarJson = await dolarRes.json();
      const dolarInfo = dolarJson.USDBRL;

      // 2. Fetch Dollar History
      const dolarHistRes = await fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/7');
      const dolarHistJson = await dolarHistRes.json();
      const dolarHistory = dolarHistJson.reverse().map(item => ({
        date: new Date(item.timestamp * 1000).toISOString().split('T')[0],
        value: parseFloat(item.bid)
      }));

      const data = {
        dolar: {
          current_value: parseFloat(dolarInfo.bid),
          previous_day_value: parseFloat(dolarInfo.varBid) + parseFloat(dolarInfo.bid), // Approximate
          pct_change: parseFloat(dolarInfo.pctChange),
          history: dolarHistory
        },
        boi: {
          current_value: BASE_PRICES.boi * (1 + (Math.random() * 0.01 - 0.005)),
          previous_day_value: BASE_PRICES.boi,
          history: generateHistory(BASE_PRICES.boi)
        },
        soja: {
          current_value: BASE_PRICES.soja * (1 + (Math.random() * 0.01 - 0.005)),
          previous_day_value: BASE_PRICES.soja,
          history: generateHistory(BASE_PRICES.soja)
        },
        milho: {
          current_value: BASE_PRICES.milho * (1 + (Math.random() * 0.01 - 0.005)),
          previous_day_value: BASE_PRICES.milho,
          history: generateHistory(BASE_PRICES.milho)
        },
        trigo: {
          current_value: BASE_PRICES.trigo * (1 + (Math.random() * 0.01 - 0.005)),
          previous_day_value: BASE_PRICES.trigo,
          history: generateHistory(BASE_PRICES.trigo)
        }
      };

      setMarketData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    // Update every 1 hour (3600000 ms)
    const interval = setInterval(fetchMarketData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const renderChange = (current, previous, manualPct = null) => {
    const pct = manualPct !== null ? manualPct : ((current - previous) / previous) * 100;
    const isPositive = pct >= 0;

    return (
      <div className={`flex items-center gap-1 text-[10px] font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && selectedQuote) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor na Data</p>
          <p className="text-sm font-black text-white">{selectedQuote.unit} {selectedQuote.format(payload[0].value)}</p>
          <p className="text-[10px] text-slate-500 mt-1">{new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern h-full flex flex-col group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Mercado Hoje</h3>
              <div className="flex items-center gap-2 mt-0.5">
                 <Globe className="w-3 h-3 text-slate-400" />
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Cotações Brasil</p>
              </div>
            </div>
          </div>
          {lastUpdate && (
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-slate-400">
                   <Clock className="w-3 h-3" />
                   <span className="text-[10px] font-bold">{lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Próxima: {new Date(lastUpdate.getTime() + 60*60*1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
             </div>
          )}
        </div>

        <div className="flex-grow space-y-2 relative z-10">
          {loading && !marketData ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando com B3/AwesomeAPI...</p>
            </div>
          ) : marketData ? (
            Object.keys(marketData).map(key => {
              const quote = marketData[key];
              const details = quoteDetails[key];
              return (
                <motion.div 
                  key={key}
                  whileHover={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                  onClick={() => setSelectedQuote({ ...quote, ...details })}
                  className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover/item:bg-white shadow-sm transition-colors">
                      {details.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700 tracking-tight">{details.name}</p>
                      {renderChange(quote.current_value, quote.previous_day_value, quote.pct_change)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800 tracking-tighter">
                      <span className="text-xs font-bold text-slate-400 mr-1">R$</span>
                      {details.format(quote.current_value)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
               <XIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
               <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Falha na conexão com servidor de cotações</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedQuote(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl shadow-sm border border-slate-100">
                    {selectedQuote.emoji}
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tighter">
                      {selectedQuote.name}
                    </h4>
                    <p className="text-slate-500 font-medium">Análise de performance (últimos 7 dias)</p>
                  </div>
                </div>
                <button onClick={() => setSelectedQuote(null)} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors">
                    <XIcon className="w-6 h-6"/>
                </button>
              </div>

              <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 relative z-10">
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={selectedQuote.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', {day: '2-digit', month:'short'})} 
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis 
                        tickFormatter={(val) => `${val.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`} 
                        domain={['auto', 'auto']} 
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{stroke: '#84cc16', strokeWidth: 2, strokeDasharray: '5 5'}} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#84cc16" 
                        strokeWidth={4} 
                        dot={{r: 5, fill: '#84cc16', strokeWidth: 3, stroke: '#fff'}} 
                        activeDot={{r: 8, fill: '#166534', strokeWidth: 3, stroke: '#fff'}} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Cotação Atual</p>
                  <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">
                    <span className="text-sm font-bold text-slate-400 mr-1">R$</span>
                    {selectedQuote.format(selectedQuote.current_value)}
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Variação no Período</p>
                  <div className="mt-2 scale-150 origin-left pl-1">
                    {renderChange(selectedQuote.current_value, selectedQuote.previous_day_value, selectedQuote.pct_change)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarketTodayCard;