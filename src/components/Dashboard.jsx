import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, LayoutDashboard, Wallet, TrendingUp, TrendingDown, Landmark,
  BarChart3, Settings, LogOut, Menu, X, ChevronRight, User, Bell,
  ChevronDown, Check, Info, Shield, HelpCircle, Smartphone, Map,
  Wheat, Beef, Droplets, Calendar, PlusCircle, Search, Tags as TagsIcon, MapPin,
  GitCommit, Beaker, Package, Archive, Baby, Milk, Layers,
  ShoppingCart, DollarSign, Syringe, ArrowRightLeft,
  CircleDot as RepeatIcon, ArrowUpRight, ArrowDownRight,
  Lock, Clock, AlertTriangle, Crown, ShieldCheck
} from 'lucide-react';
import Logo from '@/components/Logo';
import { banks } from '@/data/banks';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import WalletManager from '@/components/WalletManager';
import TransactionManager from '@/components/TransactionManager';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import PropertyManager from '@/components/PropertyManager';
import LivestockManager from '@/components/LivestockManager';
import CategoryManager from '@/components/CategoryManager';
import CategoriesPage from '@/pages/CategoriesPage';
import PlotManager from '@/components/crops/PlotManager';
import PlotDetails from '@/components/crops/PlotDetails';
import HarvestsManager from '@/components/crops/HarvestsManager';
import InputsManager from '@/components/crops/InputsManager';
import SiloManager from '@/components/crops/SiloManager';
import CropHarvestManager from '@/components/crops/CropHarvestManager';
import PayablesReceivablesManager from '@/components/PayablesReceivablesManager';
import RecurringExpensesManager from '@/components/RecurringExpensesManager';
import NotificationBell from '@/components/NotificationBell';
import IntelligentDashboard from '@/components/IntelligentDashboard';
import TrialAlertModal from './TrialAlertModal';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { checkExpirationWarning } from '@/utils/checkUserAccess';
import { useToast } from '@/components/ui/use-toast';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';
import { checkAndGenerateRecurringExpenses } from '@/utils/recurringExpensesScheduler';

const parseWalletColor = (colorString) => {
  try {
    if (colorString && colorString.startsWith('{')) {
      const parsed = JSON.parse(colorString);
      return { hex: parsed.hex, bank: parsed.bank };
    }
  } catch (e) { }
  return { hex: colorString, bank: null };
};

const calculateUnpaidInvoiceTotal = (cardId, cardName, allTransactions) => {
  const expenses = allTransactions.filter(t => t.wallet_id === cardId && t.type === 'expense');
  
  const payments = allTransactions.filter(t => 
    t.type === 'transfer' && 
    t.description && 
    t.description.startsWith(`Pagamento Fatura ${cardName} - `)
  );

  const invoices = {};
  expenses.forEach(t => {
    if (!t.invoice_date) return;
    const invoiceMonthStr = new Date(t.invoice_date + 'T00:00:00').toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    if (!invoices[invoiceMonthStr]) {
      invoices[invoiceMonthStr] = { total: 0, paid: 0 };
    }
    invoices[invoiceMonthStr].total += t.amount;
  });

  payments.forEach(p => {
    const escapedCardName = cardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = p.description.match(new RegExp(`Pagamento Fatura ${escapedCardName} - (.+)`));
    if (match && match[1]) {
      const monthStr = match[1];
      if (invoices[monthStr]) {
        invoices[monthStr].paid += p.amount;
      }
    }
  });

  let unpaidTotal = 0;
  Object.values(invoices).forEach(inv => {
    const remaining = inv.total - inv.paid;
    if (remaining > 0.05) {
      unpaidTotal += remaining;
    }
  });

  return unpaidTotal;
};

const Dashboard = ({
  user,
  profile,
  onProfileUpdate,
  session
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('intelligent-dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({
    crops: true,
    livestock: true
  });
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showTrialAlert, setShowTrialAlert] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  const expirationWarning = checkExpirationWarning(profile);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    const [walletsRes, transactionsRes, categoriesRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*, categories(name)').eq('user_id', user.id).order('date', {
        ascending: false
      }),
      supabase.from('categories').select('*').eq('user_id', user.id)
    ]);
    setWallets(Array.isArray(walletsRes.data) ? walletsRes.data : []);
    setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : []);
    setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    if (walletsRes.error) console.error('Erro ao buscar carteiras:', walletsRes.error);
    if (transactionsRes.error) console.error('Erro ao buscar lançamentos:', transactionsRes.error);
    if (categoriesRes.error) console.error('Erro ao buscar categorias:', categoriesRes.error);
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Ao acessar o painel: se houver notificações não lidas, exibe um aviso com todas (uma vez por sessão do navegador). */
  useEffect(() => {
    if (!user?.id) return;

    const sessionKey = `meupila_pending_notifications_alert_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await fetchWithRetry(
        () =>
          supabase
            .from('notifications')
            .select('id, title, message, type, created_at')
            .eq('user_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(50),
        { maxRetries: 2, context: { functionName: 'pendingNotificationsOnAccess' } }
      );

      if (cancelled || error || !data?.length) return;

      sessionStorage.setItem(sessionKey, '1');

      const description = (
        <ul className="mt-2 max-h-52 list-disc space-y-1.5 overflow-y-auto pl-4 text-left text-sm text-slate-600">
          {data.map((n) => (
            <li key={n.id}>
              <span className="font-medium text-slate-800">{n.title}</span>
              {n.message ? (
                <span className="block text-slate-600">{n.message}</span>
              ) : null}
            </li>
          ))}
        </ul>
      );

      toast({
        title:
          data.length === 1
            ? 'Você tem 1 notificação pendente'
            : `Você tem ${data.length} notificações pendentes`,
        description,
        duration: 25000,
      });

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          const body = data
            .map((n) =>
              n.message ? `${n.title}: ${n.message}` : n.title
            )
            .join('\n');
          new Notification('Meu Pila — notificações pendentes', {
            body: body.slice(0, 350) + (body.length > 350 ? '…' : ''),
            tag: `meupila-pending-${user.id}`,
          });
        } catch {
          /* ignore */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, toast]);

  useEffect(() => {
    if (!user?.id) return;

    const sessionKey = `meupila_recurring_expenses_checked_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const checkRecurring = async () => {
      try {
        await checkAndGenerateRecurringExpenses(user, toast, () => {
          fetchData();
        });
        sessionStorage.setItem(sessionKey, '1');
      } catch (err) {
        console.error('Failed to run recurring expenses check:', err);
      }
    };

    checkRecurring();
  }, [user, toast, fetchData]);

  useEffect(() => {
    if (profile?.plan_status === 'trial' && !profile?.is_admin) {
      const expiresAt = new Date(profile.plan_expires_at);
      const now = new Date();
      const diffTime = expiresAt - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        const lastAlertShown = localStorage.getItem('lastTrialAlertShown');
        const today = new Date().toDateString();
        if (lastAlertShown !== today) {
          setTrialDaysLeft(diffDays);
          setShowTrialAlert(true);
        }
      }
    }
  }, [profile]);

  const handleTrialModalClose = () => {
    localStorage.setItem('lastTrialAlertShown', new Date().toDateString());
    setShowTrialAlert(false);
  };

  const handleGoToSubscription = () => {
    setShowTrialAlert(false);
    setActiveTab('wallets');
  };

  const handleSelectPlot = plotId => {
    setSelectedPlotId(plotId);
    setActiveTab('plot-details');
  };

  const handleSelectProperty = propertyId => {
    setSelectedPropertyId(propertyId);
    setActiveTab('plots');
  };

  const handleBackToList = () => {
    setSelectedPlotId(null);
    setActiveTab('plots');
  };

  const toggleSubmenu = submenu => {
    setOpenSubmenus(prev => ({
      ...prev,
      [submenu]: !prev[submenu]
    }));
  };

  const menuItems = useMemo(() => {
    const baseItems = [
      {
        id: 'intelligent-dashboard',
        label: 'Painel',
        icon: LayoutDashboard
      },
      {
        id: 'categories',
        label: 'Categorias',
        icon: TagsIcon
      },
      {
        id: 'wallets',
        label: 'Carteiras',
        icon: Wallet
      },
      {
        id: 'transactions',
        label: 'Lançamentos',
        icon: TrendingUp
      },
      {
        id: 'payables-receivables',
        label: 'Contas',
        icon: ArrowRightLeft
      },
      {
        id: 'recurring-expenses',
        label: 'Recorrentes',
        icon: RepeatIcon
      }
    ];

    if (profile?.account_type === 'rural') {
      baseItems.push(
        {
          id: 'properties',
          label: 'Propriedades',
          icon: MapPin
        },
        {
          id: 'crops',
          label: 'Lavoura',
          icon: Wheat,
          subItems: [
            {
              id: 'plots',
              label: 'Talhões',
              icon: Wheat
            },
            {
              id: 'harvests',
              label: 'Safras',
              icon: Layers
            },
            {
              id: 'inputs',
              label: 'Insumos',
              icon: Beaker
            },
            {
              id: 'crop-harvests',
              label: 'Colheitas',
              icon: Package
            },
            {
              id: 'silos',
              label: 'Silos',
              icon: Archive
            }
          ]
        },
        {
          id: 'livestock',
          label: 'Rebanho',
          icon: GitCommit,
          subItems: [
            {
              id: 'livestock-animals',
              label: 'Animais',
              icon: GitCommit
            },
            {
              id: 'livestock-lots',
              label: 'Lotes',
              icon: Layers
            },
            {
              id: 'livestock-purchase',
              label: 'Compra',
              icon: ShoppingCart
            },
            {
              id: 'livestock-sale',
              label: 'Venda',
              icon: DollarSign
            },
            {
              id: 'livestock-births',
              label: 'Nascimentos',
              icon: Baby
            },
            {
              id: 'livestock-milk',
              label: 'Leite',
              icon: Milk
            },
            {
              id: 'livestock-fattening',
              label: 'Engorda',
              icon: Beef
            },
            {
              id: 'livestock-events',
              label: 'Eventos',
              icon: Syringe
            }
          ]
        }
      );
    }

    baseItems.push({
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3
    });

    return baseItems;
  }, [profile?.account_type]);

  const FinancialSummaryCards = () => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const last6MonthsData = useMemo(() => {
      const data = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();

        const income = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'income' && tDate.getMonth() === month && tDate.getFullYear() === year;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate.getMonth() === month && tDate.getFullYear() === year;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          month: monthNames[month],
          receitas: income,
          despesas: expenses,
          saldo: income - expenses
        });
      }

      return data;
    }, [transactions]);

    const expensesByCategory = useMemo(() => {
      const categoryMap = {};

      transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear;
        })
        .forEach(t => {
          const categoryName = t.categories?.name || 'Sem categoria';
          categoryMap[categoryName] = (categoryMap[categoryName] || 0) + t.amount;
        });

      return Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }, [transactions, currentMonth, currentYear]);

    const COLORS = ['#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'];

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Receitas</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">Este mês</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Despesas</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  {monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}%
                </span>
                <div className="p-2 bg-red-50 rounded-lg">
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">Este mês</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gradient-to-br from-lime-500 to-lime-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/90">Saldo Total</p>
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/80">Todas as carteiras</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Receitas x Despesas</h3>
                <p className="text-sm text-slate-500">Últimos 6 meses</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-slate-600">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-slate-600">Despesas</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last6MonthsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Bar dataKey="receitas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Despesas por Categoria</h3>
              <p className="text-sm text-slate-500">Top 5 deste mês</p>
            </div>
            {expensesByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expensesByCategory.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                        <span className="text-slate-600 truncate max-w-[120px]">{category.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <p className="text-sm">Nenhuma despesa registrada</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[330px] lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Suas Carteiras</h3>
                <p className="text-sm text-slate-500">Saldos atuais</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('wallets')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2">Ver Todas</Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {wallets?.length > 0 ? (
                wallets.map(wallet => {
                  const { hex, bank } = parseWalletColor(wallet.color);
                  const bankData = banks.find(b => b.id === bank);
                  const color = hex || '#10b981';
                  const displayBalance = wallet.type === 'credit'
                    ? -calculateUnpaidInvoiceTotal(wallet.id, wallet.name, transactions)
                    : wallet.balance;
                  return (
                    <div key={wallet.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => setActiveTab('wallets')}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          {bankData?.logo ? (
                            <img src={bankData.logo} alt={bankData.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <Wallet className="w-5 h-5 animate-pulse" style={{ color }} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-tight truncate max-w-[120px]">{wallet.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{wallet.type === 'credit' ? 'Cartão de Crédito' : 'Padrão'}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold whitespace-nowrap ${displayBalance >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                        R$ {Number(displayBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma carteira cadastrada.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Saldo Acumulado</h3>
                <p className="text-sm text-slate-500">Evolução nos últimos 6 meses</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last6MonthsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke="#84cc16"
                  strokeWidth={3}
                  dot={{ fill: '#84cc16', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (loadingData) {
      return (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full"
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'intelligent-dashboard':
        return (
          <>
            <FinancialSummaryCards />
            <IntelligentDashboard user={user} profile={profile} setActiveTab={setActiveTab} />
          </>
        );
      case 'categories':
        return <CategoriesPage user={user} categories={categories} onDataChange={fetchData} />;
      case 'wallets':
        return <WalletManager user={user} profile={profile} initialWallets={wallets} onDataChange={fetchData} categories={categories} />;
      case 'transactions':
        return <TransactionManager user={user} profile={profile} initialWallets={wallets} initialTransactions={transactions} initialCategories={categories} onDataChange={fetchData} />;
      case 'payables-receivables':
        return <PayablesReceivablesManager user={user} wallets={wallets} categories={categories} onDataChange={fetchData} />;
      case 'recurring-expenses':
        return <RecurringExpensesManager user={user} wallets={wallets} categories={categories} />;
      case 'properties':
        return <PropertyManager user={user} onSelectProperty={handleSelectProperty} />;
      case 'plots':
        return <PlotManager user={user} onSelectPlot={handleSelectPlot} propertyIdFilter={selectedPropertyId} />;
      case 'plot-details':
        return <PlotDetails user={user} plotId={selectedPlotId} onBack={handleBackToList} />;
      case 'harvests':
        return <HarvestsManager user={user} setActiveTab={setActiveTab} />;
      case 'inputs':
        return <InputsManager user={user} />;
      case 'silos':
        return <SiloManager user={user} />;
      case 'crop-harvests':
        return <CropHarvestManager user={user} />;
      case 'livestock-animals':
      case 'livestock-lots':
      case 'livestock-births':
      case 'livestock-milk':
      case 'livestock-fattening':
      case 'livestock-events':
      case 'livestock-details':
      case 'livestock-lot-details':
      case 'livestock-purchase':
      case 'livestock-sale':
        return <LivestockManager user={user} activeSubTab={activeTab} onDataChange={fetchData} setActiveTab={setActiveTab} />;
      case 'reports':
        return <ReportsView user={user} profile={profile} wallets={wallets} transactions={transactions} />;
      case 'settings':
        return <SettingsView user={user} profile={profile} onProfileUpdate={onProfileUpdate} onDataChange={fetchData} />;
      default:
        return <IntelligentDashboard user={user} profile={profile} setActiveTab={setActiveTab} />;
    }
  };

  const NavButton = ({
    item,
    isSubItem = false
  }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab));
    const isExactActive = activeTab === item.id;

    const baseClasses = `w-full flex items-center space-x-3 rounded-xl transition-all duration-300 group relative overflow-hidden`;
    const padding = isSubItem ? 'pl-11 pr-3 py-2' : 'px-4 py-3';

    // Modern colors and effects
    const activeBg = isExactActive ? 'bg-lime-500/10 shadow-[inset_0_0_15px_rgba(132,204,22,0.1)]' : 'hover:bg-white/5';
    const textColors = isExactActive ? 'text-lime-400 font-semibold' : 'text-slate-400 group-hover:text-white';
    const iconColors = isExactActive ? 'text-lime-400' : 'text-slate-500 group-hover:text-slate-300';

    if (item.subItems) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`${baseClasses} ${padding} hover:bg-white/5 justify-between`}
          >
            <div className="flex items-center space-x-3">
              <Icon className={`${isActive ? 'text-lime-400' : 'text-slate-500'} transition-colors duration-300`} size={20} />
              <span className={`${isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'} transition-colors duration-300`}>
                {item.label}
              </span>
            </div>
            <ChevronDown
              className={`text-slate-500 transition-transform duration-300 ${openSubmenus[item.id] ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>
          <AnimatePresence>
            {openSubmenus[item.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-1 pb-1 space-y-1">
                  {item.subItems.map(subItem => (
                    <NavButton key={subItem.id} item={subItem} isSubItem={true} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="relative mb-1">
        <button
          onClick={() => {
            setActiveTab(item.id);
            setIsMobileMenuOpen(false);
            setSelectedPropertyId(null);
          }}
          className={`${baseClasses} ${padding} ${activeBg}`}
        >
          <Icon className={`${iconColors} transition-colors duration-300`} size={20} />
          <span className={`${textColors} transition-colors duration-300`}>{item.label}</span>

          {isExactActive && (
            <motion.div
              layoutId="active-indicator"
              className="absolute left-0 w-1 h-6 bg-lime-400 rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0D1814] text-white border-r border-white/5">
      {/* Header / Logo Section */}
      <div className="p-6 mb-2">
        <Logo theme="dark" className="px-2" />
      </div>

      {/* Navigation Section */}
      <nav className="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Menu Principal
          </p>
        </div>
        {menuItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}

        <div className="pt-8 px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Preferências
          </p>
        </div>
        <NavButton
          item={{
            id: 'settings',
            label: 'Configurações',
            icon: Settings
          }}
        />
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 group hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-300"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="font-medium">Sair da Conta</span>
        </button>
      </nav>

      {/* User Profile Mini Card Section */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3 group/profile transition-all hover:bg-white/[0.08]">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/profile:scale-105 shadow-lg ${profile?.is_admin ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30' : 'bg-gradient-to-br from-lime-500/20 to-lime-600/20 border border-lime-500/30'}`}>
              {profile?.is_admin ? (
                <Crown className="w-5 h-5 text-yellow-500" />
              ) : (
                <User className="w-5 h-5 text-lime-500" />
              )}
            </div>
            {profile?.is_admin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0D1814]">
                <ShieldCheck className="w-2.5 h-2.5 text-[#0D1814]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {profile?.name || 'Usuário'}
            </p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5">
              {profile?.is_admin ? 'Administrador' : (profile?.account_type === 'rural' ? 'Produtor Rural' : 'Plano Pessoal')}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Ver Perfil"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>

        {profile?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-yellow-900/20"
          >
            <ShieldCheck size={14} />
            PAINEL ADMIN
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TrialAlertModal
        isOpen={showTrialAlert}
        daysLeft={trialDaysLeft}
        onClose={handleTrialModalClose}
        onSubscribe={handleGoToSubscription}
      />

      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Meu Pila</h1>
          <div className="flex items-center gap-2">
            <NotificationBell
              user={user}
              onNotificationClick={url => url && setActiveTab(url.replace('/', ''))}
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-[60] transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full lg:translate-x-0'
            } w-72`}
        >
          <SidebarContent />
        </aside>

        <main className="flex-1 min-h-screen relative">
          <header className="hidden lg:flex justify-between items-center h-24 px-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {menuItems.find(item => item.id === activeTab)?.label ||
                  menuItems.flatMap(item => item.subItems || []).find(sub => sub.id === activeTab)?.label ||
                  'Painel'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                {profile?.account_type === 'rural' ? 'Gestão Rural Inteligente' : 'Gestão Financeira Pessoal'}
              </p>
            </motion.div>
            <div className="flex items-center gap-6">
              {expirationWarning && (
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${expirationWarning.daysLeft === 0
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  <Clock className="w-4 h-4" />
                  <span>
                    {expirationWarning.type === 'trial' ? 'Teste' : 'Plano'} vence {expirationWarning.daysLeft === 0 ? 'hoje' : `em ${expirationWarning.daysLeft} dias`}
                  </span>
                </div>
              )}

              {profile?.is_admin ? (
                <div className="bg-yellow-50 border border-yellow-100 text-yellow-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>Acesso Master</span>
                </div>
              ) : (
                profile?.plan_status === 'trial' && (
                  <div className="bg-lime-50 border border-lime-100 text-lime-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Modo Free Trial</span>
                  </div>
                )
              )}

              <div className="w-px h-8 bg-slate-200/60 mx-2" />

              <NotificationBell
                user={user}
                onNotificationClick={url => url && setActiveTab(url.replace('/', ''))}
              />
            </div>
          </header>

          <div className={`p-6 lg:p-10 ${activeTab === 'transactions' ? '!pl-[30px]' : ''} max-w-[1600px] mx-auto`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;