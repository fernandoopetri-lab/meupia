import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Edit, Plus } from 'lucide-react';

const PlanManagement = () => {
  const { toast } = useToast();

  const plans = [
    { name: 'Pessoal', price: '9,90', users: '1', status: 'active' },
    { name: 'Família', price: '19,90', users: '5', status: 'active' },
    { name: 'Rural', price: '39,90', users: '10', status: 'active' },
    { name: 'Gratuito (Trial)', price: '0,00', users: '1', status: 'system' },
  ];

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Funcionalidade Não Implementada",
      description: "Esta funcionalidade ainda não foi implementada."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Planos e Pagamentos</h1>
        <Button onClick={handleNotImplemented} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-5 h-5 mr-2" /> Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {plan.status === 'active' ? 'Ativo' : 'Sistema'}
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-4">R$ {plan.price}<span className="text-base font-normal text-gray-400">/mês</span></p>
            <p className="text-gray-400 mt-2">Até {plan.users} usuário(s)</p>
            <Button onClick={handleNotImplemented} variant="ghost" className="w-full mt-6 text-gray-300 hover:bg-gray-700">
              <Edit className="w-4 h-4 mr-2" /> Editar Plano
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Histórico de Pagamentos</h2>
        <div className="text-center py-16 text-gray-500">
          <CreditCard className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Funcionalidade em desenvolvimento</h3>
          <p>O histórico de pagamentos de todos os usuários aparecerá aqui.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanManagement;