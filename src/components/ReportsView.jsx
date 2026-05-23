import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Download, Droplets, DollarSign, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ReportsView = ({ transactions = [], wallets = [], user, profile }) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [inputsReport, setInputsReport] = useState({ costsPerHarvest: [] });
  const [loadingInputs, setLoadingInputs] = useState(false);
  const userType = profile?.account_type;

  const periods = [
    { id: 'month', label: 'Este Mês' },
    { id: 'quarter', label: 'Este Trimestre' },
    { id: 'year', label: 'Este Ano' },
    { id: 'all', label: 'Tudo' }
  ];

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const fetchInputsReportData = useCallback(async () => {
    if (userType !== 'rural' || !user) {
      setInputsReport({ costsPerHarvest: [] });
      return;
    }
    setLoadingInputs(true);
    
    const { data: usages, error: usagesError } = await supabase
      .from('inputs')
      .select(`
        cost,
        harvest_id,
        harvests(
          id,
          name,
          crop_name,
          plots(id, name, area)
        )
      `)
      .eq('user_id', user.id);

    if (usagesError) {
      toast({ title: 'Erro ao buscar dados de insumos', description: usagesError.message, variant: 'destructive' });
      setLoadingInputs(false);
      return;
    }

    const costsByHarvest = usages.reduce((acc, usage) => {
      if (!usage.harvests || !usage.harvests.plots) return acc;

      const harvestKey = usage.harvest_id;
      if (!acc[harvestKey]) {
        acc[harvestKey] = {
          harvestId: usage.harvest_id,
          harvestName: usage.harvests.name,
          cropName: usage.harvests.crop_name,
          plotName: usage.harvests.plots.name,
          plotArea: usage.harvests.plots.area,
          totalCost: 0
        };
      }

      acc[harvestKey].totalCost += usage.cost || 0;
      
      return acc;
    }, {});
    
    const costsPerHarvest = Object.values(costsByHarvest).map(item => ({
        ...item,
        costPerHectare: item.plotArea > 0 ? item.totalCost / item.plotArea : 0
    }));

    setInputsReport({ costsPerHarvest });
    setLoadingInputs(false);
  }, [user, userType, toast]);

  useEffect(() => {
    fetchInputsReportData();
  }, [fetchInputsReportData]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return transactions.filter(transaction => {
      if (!transaction.date) return false;
      const transactionDate = new Date(transaction.date);
      
      switch (selectedPeriod) {
        case 'month':
          return transactionDate.getMonth() === selectedMonth && 
                 transactionDate.getFullYear() === selectedYear;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
          return transactionQuarter === quarter && 
                 transactionDate.getFullYear() === now.getFullYear();
        case 'year':
          return transactionDate.getFullYear() === selectedYear;
        case 'all':
        default:
          return true;
      }
    });
  }, [transactions, selectedPeriod, selectedYear, selectedMonth]);

  const reportData = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const incomeByCategory = {};
    const expensesByCategory = {};

    filteredTransactions.forEach(transaction => {
      const categoryName = transaction.categories?.name || transaction.category || 'Sem Categoria';
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        incomeByCategory[categoryName] = 
          (incomeByCategory[categoryName] || 0) + amount;
      } else if (transaction.type === 'expense') {
        expensesByCategory[categoryName] = 
          (expensesByCategory[categoryName] || 0) + amount;
      }
    });

    return {
      income,
      expenses,
      balance: income - expenses,
      incomeByCategory,
      expensesByCategory,
      totalTransactions: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const handleExportReport = () => {
    toast({
      title: "🚧 Funcionalidade de Exportação",
      description: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const CategoryChart = ({ data, type, title }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const colors = ['#10b981', '#2563eb', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
    
    return (
      <div className="card-modern group">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-lime-50' : 'bg-red-50'}`}>
            <PieChart className={`w-5 h-5 ${type === 'income' ? 'text-lime-600' : 'text-red-600'}`} />
          </div>
        </div>
        {total > 0 ? (
          <div className="space-y-6">
            {Object.entries(data)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount], index) => {
                const percentage = (amount / total) * 100;
                return (
                  <div key={category} className="space-y-2 group/item">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{category}</span>
                        <span className="text-sm font-bold text-slate-800">
                          R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full shadow-sm"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <PieChart className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sem dados no período</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-premium">Relatórios Financeiros</h1>
          <p className="subheading-premium">Análise detalhada do seu desempenho financeiro.</p>
        </div>
        <Button
          onClick={handleExportReport}
          className="btn-secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="card-modern !p-3">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Período de Análise</p>
            <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar">
              {periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`flex-1 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedPeriod === period.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {(selectedPeriod === 'month' || selectedPeriod === 'year') && (
            <div className="flex gap-4">
              {selectedPeriod === 'month' && (
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Mês</p>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-modern h-10 bg-slate-50 border-transparent focus:bg-white"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="min-w-[100px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Ano</p>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-modern h-10 bg-slate-50 border-transparent focus:bg-white"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-modern group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-lime-500/5 rounded-full group-hover:bg-lime-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita Total</h3>
            <div className="p-2 bg-lime-50 rounded-lg"><TrendingUp className="w-5 h-5 text-lime-600" /></div>
          </div>
          <p className="text-3xl font-black text-lime-600 tracking-tight relative z-10">
            <span className="text-lg font-bold opacity-70 mr-1">R$</span>
            {reportData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-modern group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Despesa Total</h3>
            <div className="p-2 bg-red-50 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
          </div>
          <p className="text-3xl font-black text-red-600 tracking-tight relative z-10">
            <span className="text-lg font-bold opacity-70 mr-1">R$</span>
            {reportData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-modern group relative overflow-hidden">
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${reportData.balance >= 0 ? 'bg-lime-500/5' : 'bg-red-500/5'} rounded-full group-hover:opacity-100 transition-colors`} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Líquido</h3>
            <div className={`p-2 rounded-lg ${reportData.balance >= 0 ? 'bg-lime-50' : 'bg-red-50'}`}>
              <BarChart3 className={`w-5 h-5 ${reportData.balance >= 0 ? 'text-lime-600' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`text-3xl font-black tracking-tight relative z-10 ${reportData.balance >= 0 ? 'text-lime-600' : 'text-red-600'}`}>
            <span className="text-lg font-bold opacity-70 mr-1">R$</span>
            {reportData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <CategoryChart data={reportData.incomeByCategory} type="income" title="Receitas por Categoria" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <CategoryChart data={reportData.expensesByCategory} type="expenses" title="Despesas por Categoria" />
        </motion.div>
      </div>

      {userType === 'rural' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-modern">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Relatório de Insumos</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Custo por safra e talhão</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          {loadingInputs ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Processando dados...</p>
            </div>
          ) : inputsReport.costsPerHarvest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputsReport.costsPerHarvest.map((item, index) => (
                <div key={index} className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{item.harvestName || item.cropName}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.plotName} ({item.plotArea} ha)</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100 text-slate-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total</p>
                      <p className="text-sm font-black text-red-500">R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo / ha</p>
                      <p className="text-sm font-black text-blue-600">R$ {item.costPerHectare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
              <Droplets className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum custo registrado</p>
            </div>
          )}
        </motion.div>
      )}

      {reportData.totalTransactions === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Sem dados para este período</h3>
          <p className="text-slate-500">Tente selecionar um período diferente ou adicione algumas transações</p>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsView;