
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, Milk, GitCommit, Wheat, Package, Plus, Settings, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { addDays, startOfMonth, endOfMonth, subMonths, differenceInCalendarDays } from 'date-fns';
import MarketTodayCard from './MarketTodayCard';

const StatCard = ({ title, value, icon, color, loading, onClick, details, change }) => {
  const Icon = icon;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`card-modern flex flex-col justify-between group overflow-hidden relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl transition-colors duration-300 ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {change && !loading && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change.value > 0 ? 'bg-emerald-50 text-emerald-600' : change.value < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
              {change.value > 0 ? <TrendingUp className="w-3 h-3" /> : change.value < 0 ? <TrendingDown className="w-3 h-3" /> : null}
              {change.text.split('%')[0]}%
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-9 w-32 bg-slate-100 rounded-lg animate-pulse mt-1"></div>
          ) : (
            <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
          )}
        </div>
      </div>

      {details && !loading && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 relative z-10">
          {details.map((detail, index) => (
            <span key={index} className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              {detail}
            </span>
          ))}
        </div>
      )}

      {/* Subtle background decoration */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 ${color.replace('text-', 'bg-')}`} />
    </motion.div>
  );
};

const CustomDateRangePicker = ({ open, setOpen, dateRange, setDateRange, onApply }) => {
  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white p-4 rounded-xl shadow-lg">
        <DateRange
          editableDateInputs={true}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          rangeColors={['#2CB67D']}
        />
        <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => { onApply(); setOpen(false); }}>Aplicar</Button>
        </div>
      </div>
    </div>
  );
};

const IntelligentDashboard = ({ user, profile, setActiveTab }) => {
  const [stats, setStats] = useState({
    totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, walletList: [], livestockCount: 0,
    livestockByProperty: [], milkProduction: 0, milkProductionAvg: 0, milkChange: 0,
    activePlots: 0, activeCrops: [], grainStock: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      key: 'selection'
    }
  ]);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const getPeriodLabel = () => {
    switch (period) {
      case 'this_month': return 'Este Mês';
      case 'last_3_months': return 'Últimos 3 Meses';
      case 'last_6_months': return 'Últimos 6 Meses';
      case 'custom': 
        return `${dateRange[0].startDate.toLocaleDateString('pt-BR')} - ${dateRange[0].endDate.toLocaleDateString('pt-BR')}`;
      default: return 'Selecionar Período';
    }
  };

  const handleSetPeriod = (newPeriod) => {
    setPeriod(newPeriod);
    const now = new Date();
    if (newPeriod === 'this_month') {
      setDateRange([{ startDate: startOfMonth(now), endDate: endOfMonth(now), key: 'selection' }]);
    } else if (newPeriod === 'last_3_months') {
      setDateRange([{ startDate: startOfMonth(subMonths(now, 2)), endDate: endOfMonth(now), key: 'selection' }]);
    } else if (newPeriod === 'last_6_months') {
      setDateRange([{ startDate: startOfMonth(subMonths(now, 5)), endDate: endOfMonth(now), key: 'selection' }]);
    } else if (newPeriod === 'custom') {
      setShowCustomDateRange(true);
    }
  };

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const startDate = dateRange[0].startDate.toISOString();
    const endDate = dateRange[0].endDate.toISOString();
    
    // Logic for percentage change (comparing with previous period of same length)
    const diffDays = differenceInCalendarDays(dateRange[0].endDate, dateRange[0].startDate) + 1;
    const prevStartDate = addDays(dateRange[0].startDate, -diffDays).toISOString();
    const prevEndDate = addDays(dateRange[0].startDate, -1).toISOString();

    const [walletsRes, transactionsRes, livestockRes, milkRes, prevMilkRes, plotsRes, harvestsRes, stockRes] = await Promise.all([
      supabase.from('wallets').select('id, name, balance, type').eq('user_id', user.id).order('name'),
      supabase.from('transactions').select('type, amount').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
      profile?.account_type === 'rural' ? supabase.from('livestock').select('id, sex, properties(name), lot_id').eq('user_id', user.id).eq('status', 'ativo') : Promise.resolve({ data: [] }),
      profile?.account_type === 'rural' ? supabase.from('livestock_events').select('quantity, animal_id, lot_id').eq('user_id', user.id).eq('event_type', 'producao_leite').gte('event_date', startDate).lte('event_date', endDate) : Promise.resolve({ data: [] }),
      profile?.account_type === 'rural' ? supabase.from('livestock_events').select('quantity').eq('user_id', user.id).eq('event_type', 'producao_leite').gte('event_date', prevStartDate).lte('event_date', prevEndDate) : Promise.resolve({ data: [] }),
      profile?.account_type === 'rural' ? supabase.from('plots').select('id').eq('user_id', user.id).eq('status', 'active') : Promise.resolve({ data: [] }),
      profile?.account_type === 'rural' ? supabase.from('harvests').select('crop_name').eq('user_id', user.id).eq('status', 'plantado') : Promise.resolve({ data: [] }),
      profile?.account_type === 'rural' ? supabase.from('silo_stock').select('grain_type, quantity, unit').eq('user_id', user.id) : Promise.resolve({ data: [] })
    ]);

    const totalBalance = walletsRes.data?.reduce((acc, w) => acc + w.balance, 0) || 0;
    const walletList = walletsRes.data || [];
    const monthlyIncome = transactionsRes.data?.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 0;
    const monthlyExpenses = transactionsRes.data?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0;

    let ruralStats = {};
    if (profile?.account_type === 'rural') {
        const livestockByProperty = (livestockRes.data || []).reduce((acc, animal) => {
            const propName = animal.properties?.name || 'Sem Propriedade';
            acc[propName] = (acc[propName] || 0) + 1;
            return acc;
        }, {});
        
        // --- Milk Production Logic ---
        const currentMilkProduction = milkRes.data?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        const previousMilkProduction = prevMilkRes.data?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        
        const milkPercentageChange = previousMilkProduction > 0 
          ? ((currentMilkProduction - previousMilkProduction) / previousMilkProduction) * 100 
          : (currentMilkProduction > 0 ? 100 : 0);

        // Identifying producing cows in the period
        // 1. Cows that had individual entries
        const individualProducingCowIds = new Set(milkRes.data?.filter(e => e.animal_id).map(e => e.animal_id));
        
        // 2. Cows that were in lots that had entries
        const lotIdsWithProduction = new Set(milkRes.data?.filter(e => e.lot_id).map(e => e.lot_id));
        const cowsInProducingLots = new Set();
        
        livestockRes.data?.forEach(animal => {
            if (animal.lot_id && lotIdsWithProduction.has(animal.lot_id)) {
                cowsInProducingLots.add(animal.id);
            }
        });

        // Combine sets to get total unique producing cows
        const totalProducingCowsCount = new Set([...individualProducingCowIds, ...cowsInProducingLots]).size;

        // Calculate average
        const milkProductionAvg = totalProducingCowsCount > 0 
            ? currentMilkProduction / totalProducingCowsCount 
            : 0;
        // ---------------------------

        const activeCrops = (harvestsRes.data || []).reduce((acc, harvest) => {
            acc[harvest.crop_name] = (acc[harvest.crop_name] || 0) + 1;
            return acc;
        }, {});

        const grainStock = (stockRes.data || []).reduce((acc, stock) => {
            const existing = acc.find(s => s.grain_type === stock.grain_type && s.unit === stock.unit);
            if (existing) {
                existing.quantity += stock.quantity;
            } else {
                acc.push({ ...stock });
            }
            return acc;
        }, []);

        ruralStats = {
            livestockCount: (livestockRes.data || []).length,
            livestockByProperty: Object.entries(livestockByProperty).map(([name, count]) => `${name}: ${count}`),
            milkProduction: currentMilkProduction,
            milkProductionAvg,
            milkChange: milkPercentageChange,
            activePlots: (plotsRes.data || []).length,
            activeCrops: Object.entries(activeCrops).map(([name, count]) => `${name} (${count})`),
            grainStock
        };
    }
    setStats({ totalBalance, monthlyIncome, monthlyExpenses, walletList, ...ruralStats });
    setLoading(false);
  }, [user, profile?.account_type, dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = useMemo(() => {
    const allCards = [
      { 
        id: 'balance', 
        title: 'Saldo Geral', 
        value: `R$ ${(stats.totalBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: Wallet, 
        color: 'text-green-500', 
        tab: 'wallets' 
      },
      { 
        id: 'income', 
        title: 'Receitas no Período', 
        value: `R$ ${(stats.monthlyIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: TrendingUp, 
        color: 'text-blue-500', 
        tab: 'transactions' 
      },
      { 
        id: 'expenses', 
        title: 'Despesas no Período', 
        value: `R$ ${(stats.monthlyExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
        icon: TrendingDown, 
        color: 'text-red-500', 
        tab: 'transactions' 
      },
      { 
        id: 'livestock', 
        title: 'Rebanho Ativo', 
        value: stats.livestockCount || 0, 
        icon: GitCommit, 
        color: 'text-orange-500', 
        tab: 'livestock-animals', 
        rural: true, 
        details: stats.livestockByProperty || [] 
      },
      { 
        id: 'milk', 
        title: 'Leite no Período', 
        value: `${(stats.milkProduction || 0).toLocaleString('pt-BR')} L`, 
        icon: Milk, 
        color: 'text-cyan-500', 
        tab: 'livestock-milk', 
        rural: true, 
        details: [`Média: ${(stats.milkProductionAvg || 0).toFixed(1)} L/vaca`], 
        change: { 
          value: stats.milkChange || 0, 
          text: `${Math.abs((stats.milkChange || 0).toFixed(1))}% vs. período anterior` 
        } 
      },
      { 
        id: 'plots', 
        title: 'Talhões Ativos', 
        value: stats.activePlots || 0, 
        icon: Wheat, 
        color: 'text-yellow-600', 
        tab: 'plots', 
        rural: true, 
        details: [stats.activeCrops ? stats.activeCrops.join(' | ') : ''] 
      },
      { 
        id: 'grains', 
        title: 'Grãos em Estoque', 
        value: `${(stats.grainStock?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0).toLocaleString('pt-BR')} unid.`, 
        icon: Package, 
        color: 'text-purple-500', 
        tab: 'silos', 
        rural: true, 
        details: stats.grainStock?.map(s => `${s.grain_type}: ${(s.quantity || 0).toLocaleString('pt-BR')} ${s.unit}`) || [] 
      },
    ];
    return allCards.filter(card => !card.rural || profile?.account_type === 'rural');
  }, [stats, profile?.account_type]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Visão Geral</h2>
          <p className="subheading-premium">Seu resumo financeiro e de produção em um só lugar.</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    <Calendar className="mr-2 h-4 w-4" />
                    {getPeriodLabel()}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSetPeriod('this_month')}>Este Mês</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetPeriod('last_3_months')}>Últimos 3 Meses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetPeriod('last_6_months')}>Últimos 6 Meses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetPeriod('custom')}>Período Personalizado</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map(card => (
                        <StatCard
                            key={card.id}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            loading={loading}
                            details={card.details}
                            change={card.change}
                            onClick={() => setActiveTab(card.tab)}
                        />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1">
                 <MarketTodayCard />
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="card-modern">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('transactions')} 
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-lime-500/5 hover:bg-lime-500/10 border border-lime-500/10 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-lime-500 text-white mb-3 shadow-lg shadow-lime-500/20 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Lançamento</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('wallets')} 
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-blue-500 text-white mb-3 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Carteiras</span>
            </button>

            <button 
              onClick={() => setActiveTab('payables-receivables')} 
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-purple-500 text-white mb-3 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">Contas</span>
            </button>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="card-modern relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Configurações</h3>
            <p className="text-sm text-slate-500 mb-6">Personalize sua experiência, gerencie categorias e preferências.</p>
            <Button onClick={() => setActiveTab('settings')} className="btn-premium">
              <Settings className="w-4 h-4 mr-2" /> Acessar Configurações
            </Button>
          </div>
          <Settings className="absolute -right-8 -bottom-8 w-32 h-32 text-slate-100 opacity-50" />
        </motion.div>
      </div>

      <CustomDateRangePicker 
        open={showCustomDateRange}
        setOpen={setShowCustomDateRange}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onApply={fetchStats}
      />
    </div>
  );
};

export default IntelligentDashboard;
