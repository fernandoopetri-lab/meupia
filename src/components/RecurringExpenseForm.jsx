
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const RecurringExpenseForm = ({ user, categories, wallets, onSuccess, onCancel, initialData }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    wallet_id: '',
    due_day: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'active',
    observation: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  // Buscar e organizar categorias hierarquicamente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .order('parent_id', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        // Identificar raízes: categorias sem pai ou cujo pai não existe na listagem atual (órfãs)
        const allIds = new Set(data.map(c => c.id));
        const roots = data.filter(c => !c.parent_id || !allIds.has(c.parent_id));

        const buildHierarchy = (nodes, allCats, level = 0) => {
          let result = [];
          
          nodes.forEach(node => {
            const prefix = level > 0 ? '\u00A0\u00A0└─ ' : '';
            const extraSpaces = level > 1 ? '\u00A0\u00A0\u00A0\u00A0'.repeat(level - 1) : '';
            
            result.push({ 
              ...node, 
              displayName: `${extraSpaces}${prefix}${node.name}` 
            });
            
            // Buscar filhos desta categoria recursivamente
            const children = allCats.filter(c => c.parent_id === node.id);
            if (children.length > 0) {
              result = result.concat(buildHierarchy(children, allCats, level + 1));
            }
          });
          
          return result;
        };

        setHierarchicalCategories(buildHierarchy(roots, data, 0));
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        // Fallback para a lista plana passada via props caso a busca falhe
        const expenseCats = categories.filter(c => c.type === 'expense');
        setHierarchicalCategories(expenseCats.map(c => ({...c, displayName: c.name})));
      }
    };

    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.amount || !formData.category_id || !formData.wallet_id || !formData.due_day || !formData.start_date) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('O valor deve ser maior que zero.');
      }

      const dueDayNum = parseInt(formData.due_day, 10);
      if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
        throw new Error('O dia de vencimento deve estar entre 1 e 31.');
      }

      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expenseData = {
        user_id: user.id,
        name: formData.name,
        amount: amountNum,
        category_id: parseInt(formData.category_id, 10),
        wallet_id: parseInt(formData.wallet_id, 10),
        due_day: dueDayNum,
        start_date: formData.start_date,
        status: formData.status,
        observation: formData.observation || null,
        updated_at: new Date().toISOString()
      };

      let expenseId = initialData?.id;

      if (initialData) {
        const { error } = await supabase
          .from('recurring_expenses')
          .update(expenseData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Despesa recorrente atualizada.' });
      } else {
        expenseData.last_generated_at = new Date().toISOString();
        
        const { data: newExpense, error } = await supabase
          .from('recurring_expenses')
          .insert(expenseData)
          .select()
          .single();
        
        if (error) throw error;
        expenseId = newExpense.id;

        // Gerar primeira parcela automaticamente
        let targetMonth = startDate.getMonth();
        let targetYear = startDate.getFullYear();
        
        let validDueDay = dueDayNum;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        if (validDueDay > daysInMonth) validDueDay = daysInMonth;

        const dueDateString = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(validDueDay).padStart(2, '0')}`;

        const { error: payableError } = await supabase
            .from('payables_receivables')
            .insert({
                user_id: user.id,
                type: 'payable',
                description: formData.name,
                amount: amountNum,
                due_date: dueDateString,
                wallet_id: expenseData.wallet_id,
                category_id: expenseData.category_id,
                status: 'pending',
                recurring_id: expenseId,
                paid_amount: 0
            });

        if (payableError) {
            console.error("Falha ao gerar primeira parcela:", payableError);
            toast({ title: 'Aviso', description: 'Despesa criada, mas houve erro ao gerar a primeira parcela.', variant: 'destructive' });
        } else {
            toast({ title: 'Sucesso', description: 'Despesa recorrente criada e primeira parcela gerada.' });
        }
      }

      onSuccess();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Despesa *</label>
        <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Conta de Luz" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor *</label>
          <Input name="amount" type="number" step="0.01" min="0.01" value={formData.amount} onChange={handleChange} required placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Dia do Venc. (1-31) *</label>
          <Input name="due_day" type="number" min="1" max="31" value={formData.due_day} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Data de Início *</label>
        <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria *</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white text-slate-900"
          required
        >
          <option value="">Selecione uma categoria</option>
          {hierarchicalCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.displayName}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Carteira Padrão *</label>
        <select
          name="wallet_id"
          value={formData.wallet_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white text-slate-900"
          required
        >
          <option value="">Selecione uma carteira</option>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status *</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white text-slate-900"
          required
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Observações</label>
        <textarea
          name="observation"
          value={formData.observation}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 min-h-[80px] bg-white text-slate-900"
          placeholder="Opcional..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-white">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Salvar Alterações' : 'Criar Despesa Recorrente'}
        </Button>
      </div>
    </form>
  );
};

export default RecurringExpenseForm;
