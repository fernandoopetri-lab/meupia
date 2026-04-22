import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Download, Droplets, DollarSign } from 'lucide-react';
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
      <div className="chart-container">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">{title}</h3>
        {total > 0 ? (
          <div className="space-y-4">
            {Object.entries(data)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount], index) => {
                const percentage = (amount / total) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-800">
                          R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Sem dados de {type === 'income' ? 'receitas' : 'despesas'} para este período</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Relatórios Financeiros</h1>
        <Button
          onClick={handleExportReport}
          className="btn-secondary"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="chart-container">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Período
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mês
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ano
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-field"
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="wallet-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Receita Total</h3>
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            R$ {reportData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="wallet-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Despesa Total</h3>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            R$ {reportData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="wallet-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Saldo Líquido</h3>
            <BarChart3 className={`w-6 h-6 ${reportData.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${reportData.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            R$ {reportData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="chart-container">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Relatório de Insumos</h3>
          {loadingInputs ? (
            <div className="text-center py-8">Carregando dados de insumos...</div>
          ) : inputsReport.costsPerHarvest.length > 0 ? (
            <div className="space-y-4">
              {inputsReport.costsPerHarvest.map((item, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-800">{item.harvestName ? `${item.harvestName} - ${item.cropName}` : item.cropName} ({item.plotName})</p>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-red-500" />
                      <div>
                        <p className="text-slate-500">Custo Total</p>
                        <p className="font-medium text-slate-700">R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-slate-500">Custo por Hectare</p>
                        <p className="font-medium text-slate-700">R$ {item.costPerHectare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Nenhum custo de insumo registrado ainda.</p>
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