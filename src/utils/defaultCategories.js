export const PERSONAL_CATEGORIES = [
  { 
    name: 'Receitas', 
    type: 'income', 
    subcategories: [
      { name: 'Salário', type: 'income' },
      { name: 'Rendimentos', type: 'income' },
      { name: 'Outras Receitas', type: 'income' },
    ]
  },
  { 
    name: 'Moradia', 
    type: 'expense', 
    subcategories: [
      { name: 'Aluguel/Financiamento', type: 'expense' },
      { name: 'Energia Elétrica', type: 'expense' },
      { name: 'Água e Esgoto', type: 'expense' },
      { name: 'Internet/TV', type: 'expense' },
      { name: 'Manutenção', type: 'expense' },
      { name: 'Gás', type: 'expense' },
    ]
  },
  { 
    name: 'Alimentação', 
    type: 'expense', 
    subcategories: [
      { name: 'Supermercado', type: 'expense' },
      { name: 'Restaurante', type: 'expense' },
      { name: 'Lanches/Café', type: 'expense' },
    ]
  },
  { 
    name: 'Transporte', 
    type: 'expense', 
    subcategories: [
      { name: 'Combustível', type: 'expense' },
      { name: 'Manutenção Veículo', type: 'expense' },
      { name: 'IPVA/Licenciamento', type: 'expense' },
      { name: 'Uber/Táxi/Ônibus', type: 'expense' },
    ]
  },
  { 
    name: 'Saúde', 
    type: 'expense', 
    subcategories: [
      { name: 'Farmácia', type: 'expense' },
      { name: 'Consultas/Exames', type: 'expense' },
      { name: 'Plano de Saúde', type: 'expense' },
    ]
  },
  { 
    name: 'Lazer', 
    type: 'expense', 
    subcategories: [
      { name: 'Viagens', type: 'expense' },
      { name: 'Streaming/Assinaturas', type: 'expense' },
      { name: 'Cinema/Shows', type: 'expense' },
    ]
  },
  { 
    name: 'Educação', 
    type: 'expense', 
    subcategories: [
      { name: 'Cursos', type: 'expense' },
      { name: 'Mensalidade Escolar', type: 'expense' },
      { name: 'Material Escolar', type: 'expense' },
    ]
  },
  { 
    name: 'Financeiro', 
    type: 'expense', 
    subcategories: [
      { name: 'Impostos', type: 'expense' },
      { name: 'Taxas Bancárias', type: 'expense' },
      { name: 'Empréstimos', type: 'expense' },
    ]
  }
];

export const RURAL_SPECIFIC_CATEGORIES = [
  {
    name: 'Moradia',
    type: 'expense',
    subcategories: [
      { name: 'Aluguel/Financiamento', type: 'expense' },
      { name: 'Energia Elétrica', type: 'expense' },
      { name: 'Água e Esgoto', type: 'expense' },
      { name: 'Internet/TV', type: 'expense' },
      { name: 'Manutenção', type: 'expense' },
      { name: 'Gás', type: 'expense' },
    ]
  },
  {
    name: 'Alimentação',
    type: 'expense',
    subcategories: [
      { name: 'Supermercado', type: 'expense' },
      { name: 'Restaurante', type: 'expense' },
      { name: 'Lanches/Café', type: 'expense' },
    ]
  },
  {
    name: 'Transporte',
    type: 'expense',
    subcategories: [
      { name: 'Combustível', type: 'expense' },
      { name: 'Manutenção Veículo', type: 'expense' },
      { name: 'IPVA/Licenciamento', type: 'expense' },
      { name: 'Uber/Táxi/Ônibus', type: 'expense' },
    ]
  },
  { 
    name: 'Receitas Agrícolas', 
    type: 'income', 
    subcategories: [
      { name: 'Venda de Grãos', type: 'income' },
      { name: 'Venda de Leite', type: 'income' },
      { name: 'Venda de Animais', type: 'income' },
      { name: 'Serviços Prestados', type: 'income' },
    ]
  },
  { 
    name: 'Insumos', 
    type: 'expense', 
    subcategories: [
      { name: 'Sementes', type: 'expense' },
      { name: 'Fertilizantes', type: 'expense' },
      { name: 'Defensivos', type: 'expense' },
      { name: 'Ração/Sal Mineral', type: 'expense' },
      { name: 'Medicamentos Vet.', type: 'expense' },
    ]
  },
  { 
    name: 'Operacional', 
    type: 'expense', 
    subcategories: [
      { name: 'Combustível Trator', type: 'expense' },
      { name: 'Manutenção Máquinas', type: 'expense' },
      { name: 'Peças', type: 'expense' },
      { name: 'Fretes', type: 'expense' },
    ]
  },
  { 
    name: 'Mão de Obra Rural', 
    type: 'expense', 
    subcategories: [
      { name: 'Salários Funcionários', type: 'expense' },
      { name: 'Diaristas', type: 'expense' },
      { name: 'Encargos Trabalhistas', type: 'expense' },
    ]
  },
  { 
    name: 'Infraestrutura', 
    type: 'expense', 
    subcategories: [
      { name: 'Cercas', type: 'expense' },
      { name: 'Benfeitorias', type: 'expense' },
      { name: 'Energia Rural', type: 'expense' },
    ]
  }
];

export const getDefaultCategories = (planType) => {
  if (planType === 'rural') {
    return [...PERSONAL_CATEGORIES, ...RURAL_SPECIFIC_CATEGORIES];
  }
  // Default for 'personal' and 'familiar'
  return PERSONAL_CATEGORIES;
};