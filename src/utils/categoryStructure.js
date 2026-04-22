import { 
  Home, ShoppingCart, Car, Heart, GraduationCap, 
  Smile, DollarSign, Briefcase, TrendingUp, Wallet,
  Tractor, Sprout, Hammer, Users, Warehouse, Wheat
} from 'lucide-react';

export const PERSONAL_CATEGORIES = [
  {
    name: 'Receitas',
    type: 'income',
    color: '#10b981', // emerald-500
    icon: 'TrendingUp',
    subcategories: [
      { name: 'Salário', type: 'income', icon: 'Wallet', color: '#34d399' },
      { name: 'Rendimentos', type: 'income', icon: 'TrendingUp', color: '#34d399' },
      { name: 'Outras Receitas', type: 'income', icon: 'DollarSign', color: '#34d399' },
    ]
  },
  {
    name: 'Moradia',
    type: 'expense',
    color: '#f59e0b', // amber-500
    icon: 'Home',
    subcategories: [
      { name: 'Aluguel/Financiamento', type: 'expense', icon: 'Home', color: '#fbbf24' },
      { name: 'Energia Elétrica', type: 'expense', icon: 'Zap', color: '#fbbf24' },
      { name: 'Água e Esgoto', type: 'expense', icon: 'Droplets', color: '#fbbf24' },
      { name: 'Internet/TV', type: 'expense', icon: 'Wifi', color: '#fbbf24' },
      { name: 'Manutenção', type: 'expense', icon: 'Hammer', color: '#fbbf24' },
      { name: 'Gás', type: 'expense', icon: 'Flame', color: '#fbbf24' },
    ]
  },
  {
    name: 'Alimentação',
    type: 'expense',
    color: '#ef4444', // red-500
    icon: 'ShoppingCart',
    subcategories: [
      { name: 'Supermercado', type: 'expense', icon: 'ShoppingCart', color: '#f87171' },
      { name: 'Restaurante', type: 'expense', icon: 'Utensils', color: '#f87171' },
      { name: 'Lanches/Café', type: 'expense', icon: 'Coffee', color: '#f87171' },
    ]
  },
  {
    name: 'Transporte',
    type: 'expense',
    color: '#3b82f6', // blue-500
    icon: 'Car',
    subcategories: [
      { name: 'Combustível', type: 'expense', icon: 'Fuel', color: '#60a5fa' },
      { name: 'Manutenção Veículo', type: 'expense', icon: 'Wrench', color: '#60a5fa' },
      { name: 'IPVA/Licenciamento', type: 'expense', icon: 'FileText', color: '#60a5fa' },
      { name: 'Uber/Táxi/Ônibus', type: 'expense', icon: 'Bus', color: '#60a5fa' },
    ]
  },
  {
    name: 'Saúde',
    type: 'expense',
    color: '#ec4899', // pink-500
    icon: 'Heart',
    subcategories: [
      { name: 'Farmácia', type: 'expense', icon: 'Pill', color: '#f472b6' },
      { name: 'Consultas/Exames', type: 'expense', icon: 'Stethoscope', color: '#f472b6' },
      { name: 'Plano de Saúde', type: 'expense', icon: 'Activity', color: '#f472b6' },
    ]
  },
  {
    name: 'Educação',
    type: 'expense',
    color: '#8b5cf6', // violet-500
    icon: 'GraduationCap',
    subcategories: [
      { name: 'Cursos', type: 'expense', icon: 'BookOpen', color: '#a78bfa' },
      { name: 'Mensalidade Escolar', type: 'expense', icon: 'School', color: '#a78bfa' },
      { name: 'Material Escolar', type: 'expense', icon: 'PenTool', color: '#a78bfa' },
    ]
  },
  {
    name: 'Lazer',
    type: 'expense',
    color: '#14b8a6', // teal-500
    icon: 'Smile',
    subcategories: [
      { name: 'Viagens', type: 'expense', icon: 'Plane', color: '#2dd4bf' },
      { name: 'Streaming/Assinaturas', type: 'expense', icon: 'Tv', color: '#2dd4bf' },
      { name: 'Cinema/Shows', type: 'expense', icon: 'Ticket', color: '#2dd4bf' },
    ]
  },
  {
    name: 'Financeiro',
    type: 'expense',
    color: '#64748b', // slate-500
    icon: 'DollarSign',
    subcategories: [
      { name: 'Impostos', type: 'expense', icon: 'FileText', color: '#94a3b8' },
      { name: 'Taxas Bancárias', type: 'expense', icon: 'CreditCard', color: '#94a3b8' },
      { name: 'Empréstimos', type: 'expense', icon: 'Banknote', color: '#94a3b8' },
    ]
  }
];

export const RURAL_CATEGORIES = [
  {
    name: 'Receitas Rurais',
    type: 'income',
    color: '#16a34a', // green-600
    icon: 'Wheat',
    subcategories: [
      { name: 'Venda de Grãos', type: 'income', icon: 'Wheat', color: '#22c55e' },
      { name: 'Venda de Leite', type: 'income', icon: 'Milk', color: '#22c55e' },
      { name: 'Venda de Animais', type: 'income', icon: 'Cat', color: '#22c55e' }, // Lucide doesn't have Cow, using Cat as placeholder or generic
      { name: 'Serviços Prestados', type: 'income', icon: 'Briefcase', color: '#22c55e' },
    ]
  },
  {
    name: 'Insumos',
    type: 'expense',
    color: '#84cc16', // lime-500
    icon: 'Sprout',
    subcategories: [
      { name: 'Sementes', type: 'expense', icon: 'Sprout', color: '#a3e635' },
      { name: 'Fertilizantes', type: 'expense', icon: 'FlaskConical', color: '#a3e635' },
      { name: 'Defensivos', type: 'expense', icon: 'Shield', color: '#a3e635' },
      { name: 'Ração/Sal Mineral', type: 'expense', icon: 'Package', color: '#a3e635' },
      { name: 'Medicamentos Vet.', type: 'expense', icon: 'Syringe', color: '#a3e635' },
    ]
  },
  {
    name: 'Maquinário',
    type: 'expense',
    color: '#ea580c', // orange-600
    icon: 'Tractor',
    subcategories: [
      { name: 'Combustível Trator', type: 'expense', icon: 'Fuel', color: '#f97316' },
      { name: 'Manutenção Máquinas', type: 'expense', icon: 'Wrench', color: '#f97316' },
      { name: 'Peças', type: 'expense', icon: 'Settings', color: '#f97316' },
      { name: 'Fretes', type: 'expense', icon: 'Truck', color: '#f97316' },
    ]
  },
  {
    name: 'Mão de Obra',
    type: 'expense',
    color: '#0ea5e9', // sky-500
    icon: 'Users',
    subcategories: [
      { name: 'Salários Funcionários', type: 'expense', icon: 'UserCheck', color: '#38bdf8' },
      { name: 'Diaristas', type: 'expense', icon: 'UserPlus', color: '#38bdf8' },
      { name: 'Encargos Trabalhistas', type: 'expense', icon: 'FileText', color: '#38bdf8' },
    ]
  },
  {
    name: 'Estrutura',
    type: 'expense',
    color: '#78350f', // amber-900
    icon: 'Warehouse',
    subcategories: [
      { name: 'Cercas', type: 'expense', icon: 'Grid', color: '#92400e' },
      { name: 'Benfeitorias', type: 'expense', icon: 'Hammer', color: '#92400e' },
      { name: 'Energia Rural', type: 'expense', icon: 'Zap', color: '#92400e' },
    ]
  },
  {
    name: 'Financeiro Rural',
    type: 'expense',
    color: '#475569', // slate-600
    icon: 'Landmark',
    subcategories: [
      { name: 'Financiamento Custeio', type: 'expense', icon: 'Banknote', color: '#64748b' },
      { name: 'Financiamento Investimento', type: 'expense', icon: 'TrendingUp', color: '#64748b' },
      { name: 'Seguro Agrícola', type: 'expense', icon: 'ShieldCheck', color: '#64748b' },
    ]
  }
];