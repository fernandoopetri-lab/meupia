import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart2, CreditCard, Activity, LogOut, Menu, X, Shield, Clock, Settings2, DollarSign, History, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import PlansManagement from './PlansManagement';
import SystemSettings from './SystemSettings';
import AuditLogs from './AuditLogs';
import PaymentSettings from '@/components/admin/payment/PaymentSettings';
import AdminChargesManager from '@/components/admin/payment/AdminChargesManager';
import WebhookMonitoring from '@/components/admin/payment/WebhookMonitoring';
import PlanChangeHistory from '@/components/admin/payment/PlanChangeHistory';
import AccessControlPanel from '@/components/admin/access/AccessControlPanel';
import WebhooksPage from '@/components/WebhooksPage'; // New Import
import { checkExpirationWarning } from '@/utils/checkUserAccess';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AdminPanel = ({ user, profile }) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const expirationWarning = checkExpirationWarning(profile);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'access', label: 'Controle de Acesso', icon: Shield },
    { id: 'plans', label: 'Planos e Configurações', icon: Settings2 },
    { id: 'webhooks', label: 'Webhooks', icon: Zap }, // New Item
    { id: 'payments', label: 'Pagamentos (ASAAS)', icon: CreditCard },
    { id: 'logs', label: 'Logs de Auditoria', icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement adminUser={user} />;
      case 'access':
        return <AccessControlPanel />;
      case 'webhooks': // New Case
        return <WebhooksPage />;
      case 'plans':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Administração do Sistema</h1>
            <Tabs defaultValue="management" className="w-full">
              <TabsList className="bg-gray-800 border-gray-700 text-gray-400">
                <TabsTrigger value="management" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Gerenciar Planos</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Configurações Globais</TabsTrigger>
              </TabsList>
              <TabsContent value="management" className="mt-6">
                <PlansManagement />
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </div>
        );
      case 'payments':
        return (
           <div className="space-y-6">
             <h1 className="text-3xl font-bold text-white mb-6">Gestão de Pagamentos</h1>
             <Tabs defaultValue="charges" className="w-full">
                <TabsList className="bg-gray-800 border-gray-700 text-gray-400">
                    <TabsTrigger value="charges" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                        <DollarSign className="w-4 h-4 mr-2" />Cobranças
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                        <Activity className="w-4 h-4 mr-2" />Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                        <History className="w-4 h-4 mr-2" />Histórico
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                        <Settings2 className="w-4 h-4 mr-2" />Configuração API
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="charges" className="mt-6">
                    <AdminChargesManager />
                </TabsContent>
                <TabsContent value="webhooks" className="mt-6">
                    <WebhookMonitoring />
                </TabsContent>
                <TabsContent value="history" className="mt-6">
                    <PlanChangeHistory />
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                    <PaymentSettings />
                </TabsContent>
             </Tabs>
           </div>
        );
      case 'logs':
        return <AuditLogs />;
      default:
        return <AdminDashboard />;
    }
  };

  const NavButton = ({ item }) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <div className="lg:hidden bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Pila</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-800">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <div className="flex">
        <div className={`fixed lg:relative inset-y-0 left-0 z-50 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64`}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Pila</h1>
                <p className="text-sm text-gray-400">Painel de Controle</p>
              </div>
            </div>
            
            {expirationWarning && (
                <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                    expirationWarning.daysLeft === 0 ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-orange-900/30 text-orange-400 border-orange-800'
                }`}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>
                        Seu acesso {expirationWarning.type === 'trial' ? 'teste' : 'pago'} vence {expirationWarning.daysLeft === 0 ? 'hoje' : `em ${expirationWarning.daysLeft} dias`}
                    </span>
                </div>
            )}

            <nav className="flex-grow space-y-2">
              {menuItems.map(item => <NavButton key={item.id} item={item} />)}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-700 space-y-2">
              <button onClick={() => window.location.href = '/'} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-xl transition-all">
                <span>Voltar ao App</span>
              </button>
              <button onClick={signOut} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/50 rounded-xl transition-all">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
        <main className="flex-1 p-6">
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
        </main>
      </div>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
};

export default AdminPanel;