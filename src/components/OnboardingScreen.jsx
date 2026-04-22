import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, User, Users, Tractor, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getDefaultCategories } from '@/utils/defaultCategories';
import { getTrialDurationDays, getPlanByType } from '@/utils/planMigration';

const OnboardingScreen = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const accountTypes = [
    {
      id: 'personal',
      title: 'Uso Pessoal',
      description: 'Ideal para solteiros ou gestão individual. Controle seus gastos e receitas com simplicidade.',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'familiar',
      title: 'Uso Familiar',
      description: 'Para casais ou famílias. Gerencie o orçamento da casa em conjunto.',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      id: 'rural',
      title: 'Produtor Rural',
      description: 'Específico para gestão de propriedades rurais, safras, rebanho e maquinário.',
      icon: Tractor,
      color: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200'
    }
  ];

  const createCategoriesRecursively = async (categories, parentId = null) => {
    for (const category of categories) {
      // Check if category already exists to prevent duplicates
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', category.name)
        .eq('type', category.type)
        .maybeSingle();

      let categoryId;

      if (existing) {
        categoryId = existing.id;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: category.name,
            type: category.type,
            status: 'active',
            parent_id: parentId
          })
          .select()
          .single();

        if (error) {
          console.error(`Error creating category ${category.name}:`, error);
          continue;
        }
        if (data) categoryId = data.id;
      }

      if (categoryId && category.subcategories && category.subcategories.length > 0) {
        await createCategoriesRecursively(category.subcategories, categoryId);
      }
    }
  };

  const handleContinue = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      // 1. Get configuration data
      const trialDays = await getTrialDurationDays();
      
      // Attempt to find a plan matching the selected type
      const plan = await getPlanByType(selectedType);

      // 2. Setup categories
      const defaultCategories = getDefaultCategories(selectedType);
      await createCategoriesRecursively(defaultCategories);
      
      // 3. Calculate trial end date
      const createdAt = new Date();
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(createdAt.getDate() + trialDays);
      const expiresAtISO = expiresAt.toISOString();

      // 4. Update profile with plan info
      const updatePayload = {
        account_type: selectedType, // Keep for legacy
        plan_status: 'trial', 
        plan_expires_at: expiresAtISO,
        trial_end_date: expiresAtISO
      };

      if (plan) {
        updatePayload.current_plan_id = plan.id;
      }

      // Ensure profile exists before updating (upsert)
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            name: user.user_metadata?.name || 'Usuário',
            ...updatePayload
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      // 5. Call parent callback
      await onComplete(selectedType); // Pass legacy type for now
      
      toast({
        title: "Bem-vindo!",
        description: "Sua conta foi configurada com sucesso.",
      });
    } catch (error) {
      console.error('Error during onboarding:', error);
      toast({
        title: "Erro",
        description: "Houve um problema ao configurar sua conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel - Image/Branding */}
        <div className="w-full md:w-1/3 bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Meu Pila</h1>
            <p className="text-slate-400 text-sm">Gestão financeira inteligente</p>
          </div>
          <div className="relative z-10 mt-12 md:mt-0">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Vamos configurar sua conta
            </h2>
            <p className="text-slate-300">
              Escolha o perfil que melhor se adapta às suas necessidades para personalizarmos sua experiência.
            </p>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center space-x-2 mb-8">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold">1</span>
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Tipo de Conta</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-6">Qual é o seu objetivo principal?</h3>

            <div className="space-y-4 mb-8">
              {accountTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? `${type.border} ${type.bg}` 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg ${isSelected ? 'bg-white' : 'bg-slate-100'} mr-4`}>
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <div className="flex-grow">
                        <h4 className={`font-semibold ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>
                          {type.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {type.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className={`w-6 h-6 rounded-full ${type.color.replace('text', 'bg')} flex items-center justify-center`}>
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleContinue} 
                disabled={!selectedType || loading}
                className="btn-primary px-8 py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;