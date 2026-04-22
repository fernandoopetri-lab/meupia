import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, TrendingUp, X as XIcon } from 'lucide-react';

const MarketTodayCard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const quoteDetails = {
    boi: { name: 'Arroba do Boi', emoji: '🐂', unit: 'R$', format: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    soja: { name: 'Soja', emoji: '🌾', unit: 'R$', format: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    milho: { name: 'Milho', emoji: '🌽', unit: 'R$', format: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    trigo: { name: 'Trigo', emoji: '🌾', unit: 'R$', format: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
    dolar: { name: 'Dólar', emoji: '💵', unit: 'R$', format: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 4 }) },
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      if (error) {
        console.error("Error fetching market data:", error);
      } else {
        setMarketData(data);
      }
      setLoading(false);
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const renderChange = (current, previous) => {
    if (previous === 0) return <span className="text-gray-500">● N/A</span>; // Avoid division by zero

    const change = current - previous;
    const percentChange = (change / previous) * 100;

    if (change > 0) return <span className="text-green-500">▲ {percentChange.toFixed(2)}%</span>;
    if (change < 0) return <span className="text-red-500">▼ {percentChange.toFixed(2)}%</span>;
    return <span className="text-gray-500">● 0.00%</span>;
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && selectedQuote) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-2 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-bold">{`${selectedQuote.unit} ${selectedQuote.format(payload[0].value)}`}</p>
          <p className="text-sm text-slate-500">{new Date(label).toLocaleDateString('pt-BR')}</p>
        </div>
      );
    }
    return null;
  };

  const renderQuote = (key) => {
    const quote = marketData[key];
    const details = quoteDetails[key];
    if (!quote || !details) return null;

    return (
      <motion.div 
        key={key}
        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
        onClick={() => setSelectedQuote({ ...quote, ...details })}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{details.emoji}</span>
          <div>
            <p className="font-semibold text-slate-700">{details.name}</p>
            <p className="text-xs text-slate-500">{renderChange(quote.current_value, quote.previous_day_value)}</p>
          </div>
        </div>
        <p className="font-bold text-slate-800">{`${details.unit} ${details.format(quote.current_value)}`}</p>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-container h-full flex flex-col"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-full bg-emerald-100">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Mercado Hoje</h3>
        </div>
        <div className="flex-grow space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : marketData ? (
            Object.keys(marketData).map(key => renderQuote(key))
          ) : (
            <p className="text-slate-500 text-center">Não foi possível carregar os dados.</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedQuote(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-xl font-bold text-slate-800">{selectedQuote.name} ({selectedQuote.emoji})</h4>
                    <p className="text-slate-500">Variação nos últimos 7 dias</p>
                </div>
                <button onClick={() => setSelectedQuote(null)} className="p-1 rounded-full hover:bg-slate-100 -mt-1 -mr-1">
                    <XIcon className="w-5 h-5 text-slate-600"/>
                </button>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={selectedQuote.history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', {day: '2-digit', month:'2-digit'})} tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(val) => `${selectedQuote.unit} ${selectedQuote.format(val)}`} domain={['dataMin - 1', 'dataMax + 1']} tick={{fontSize: 12}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarketTodayCard;