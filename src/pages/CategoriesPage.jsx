import React from 'react';
import { motion } from 'framer-motion';
import CategoryManager from '@/components/CategoryManager';

const CategoriesPage = ({ user, categories, onDataChange }) => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-slate-800">Categorias</h2>
        <p className="text-slate-500 mt-1">Gerencie as categorias de receitas e despesas para organizar suas finanças.</p>
      </motion.div>

      <CategoryManager 
        user={user} 
        initialCategories={categories} 
        onDataChange={onDataChange} 
      />
    </div>
  );
};

export default CategoriesPage;