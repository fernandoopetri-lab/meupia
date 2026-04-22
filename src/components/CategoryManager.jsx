import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, ToggleLeft, ToggleRight, X, Trash2, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const CategoryManager = ({ user, initialCategories, onDataChange }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState(initialCategories || []);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'expense', parent_id: '' });
  const [activeTab, setActiveTab] = useState('expense');

  useEffect(() => {
    setCategories(initialCategories || []);
  }, [initialCategories]);

  const resetForm = () => {
    setFormData({ name: '', type: activeTab, parent_id: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      type: category.type,
      parent_id: category.parent_id || '' 
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Erro", description: "O nome da categoria é obrigatório.", variant: "destructive" });
      return;
    }

    const parentId = formData.parent_id ? parseInt(formData.parent_id) : null;
    
    // Basic loop prevention: cannot set parent to self
    if (editingCategory && parentId === editingCategory.id) {
      toast({ title: "Erro", description: "Uma categoria não pode ser pai de si mesma.", variant: "destructive" });
      return;
    }

    const categoryData = {
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      status: editingCategory ? editingCategory.status : 'active',
      parent_id: parentId
    };

    let error;
    if (editingCategory) {
      const { error: updateError } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoryData);
      error = insertError;
    }

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        toast({ title: "Erro", description: "Essa categoria já existe.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Sucesso!", description: `Categoria ${editingCategory ? 'atualizada' : 'adicionada'} com sucesso.` });
      resetForm();
      onDataChange();
    }
  };

  const toggleStatus = async (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    const { error: updateError } = await supabase.from('categories').update({ status: newStatus }).eq('id', category.id);

    if (updateError) {
      toast({ title: "Erro", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Status da categoria atualizado.` });
      onDataChange();
    }
  };

  const handleDelete = async (category) => {
    // Check for transactions
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', category.id)
      .limit(1);
    
    if (transError) {
      toast({ title: "Erro", description: "Não foi possível verificar o uso da categoria.", variant: "destructive" });
      return;
    }

    if (transData && transData.length > 0) {
      toast({ title: "Ação não permitida", description: "Não é possível excluir uma categoria que já foi utilizada em lançamentos. Você pode inativá-la.", variant: "destructive" });
      return;
    }

    // Check for subcategories
    const { data: childData, error: childError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', category.id)
      .limit(1);

    if (childError) {
      toast({ title: "Erro", description: "Não foi possível verificar subcategorias.", variant: "destructive" });
      return;
    }

    if (childData && childData.length > 0) {
      toast({ title: "Ação não permitida", description: "Esta categoria possui subcategorias. Remova ou mova as subcategorias antes de excluir.", variant: "destructive" });
      return;
    }

    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id);
    if (deleteError) {
      toast({ title: "Erro", description: deleteError.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Categoria excluída com sucesso." });
      onDataChange();
    }
  };

  // Filter available parents for the dropdown
  // Must be same type, and excludes self (if editing)
  const availableParents = categories.filter(c => {
    if (c.type !== formData.type) return false;
    if (editingCategory && c.id === editingCategory.id) return false;
    return true;
  });

  // Build Hierarchy Tree
  const categoryTree = useMemo(() => {
    const filtered = categories.filter(c => c.type === activeTab);
    const categoryMap = {};
    const roots = [];

    // Create nodes
    filtered.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Link children
    filtered.forEach(cat => {
      // If parent exists in our map (means it matches type filter), add to children
      if (cat.parent_id && categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      } else {
        // If no parent or parent not in this view (different type?), treat as root
        // (Though strictly speaking parent type should always match child type in this logic)
        if (!cat.parent_id) {
           roots.push(categoryMap[cat.id]);
        } else if (!categoryMap[cat.parent_id]) {
           // Orphaned due to filter (shouldn't happen if types are consistent) or root
           roots.push(categoryMap[cat.id]);
        }
      }
    });

    // Sort alphabetically
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };
    sortNodes(roots);

    return roots;
  }, [categories, activeTab]);

  const renderCategoryNode = (category, level = 0) => {
    return (
      <React.Fragment key={category.id}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 group border-b border-slate-100 last:border-0`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center">
             {level > 0 && <CornerDownRight className="w-4 h-4 text-slate-300 mr-2" />}
             <span className={`font-medium ${level > 0 ? 'text-slate-600' : 'text-slate-800'}`}>
               {category.name}
             </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold ${category.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {category.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              <button onClick={() => toggleStatus(category)}>
                {category.status === 'active' ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
              </button>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(category)} className="p-2 text-slate-400 hover:text-blue-600" title="Editar">
                  <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(category)} className="p-2 text-slate-400 hover:text-red-600" title="Excluir">
                  <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
        {category.children.map(child => renderCategoryNode(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Categorias</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Adicionar Categoria
        </Button>
      </div>

      <div className="flex space-x-2 border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab('expense'); setFormData(prev => ({ ...prev, type: 'expense' })); }} 
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'expense' ? 'border-b-2 border-red-500 text-red-600' : 'text-slate-500'}`}
        >
          Despesas
        </button>
        <button 
          onClick={() => { setActiveTab('income'); setFormData(prev => ({ ...prev, type: 'income' })); }} 
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'income' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500'}`}
        >
          Receitas
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-700">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Categoria</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                    placeholder="Ex: Alimentação" 
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria Pai (Opcional)</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData(p => ({ ...p, parent_id: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Nenhuma (Categoria Principal)</option>
                    {availableParents.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingCategory ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chart-container">
        <div className="space-y-1">
          {categoryTree.length > 0 ? (
            categoryTree.map(category => renderCategoryNode(category))
          ) : (
            <div className="text-center py-8 text-slate-500">
              Nenhuma categoria de {activeTab === 'expense' ? 'despesa' : 'receita'} encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;