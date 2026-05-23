import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, User, Users, Tractor, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
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
      description: 'Gestão individual simplificada para suas finanças do dia a dia.',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20'
    },
    {
      id: 'familiar',
      title: 'Uso Familiar',
      description: 'Orçamento compartilhado para casais e famílias modernas.',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20'
    },
    {
      id: 'rural',
      title: 'Produtor Rural',
      description: 'Gestão de alta performance para propriedades, safras e rebanho.',
      icon: Tractor,
      color: 'text-lime-500',
      bg: 'bg-lime-500/5',
      border: 'border-lime-500/20'
    }
  ];

  const createCategoriesRecursively = async (categories, parentId = null) => {
    for (const category of categories) {
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

        if (error) continue;
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
      const trialDays = await getTrialDurationDays();
      const plan = await getPlanByType(selectedType);
      const defaultCategories = getDefaultCategories(selectedType);
      await createCategoriesRecursively(defaultCategories);
      
      const createdAt = new Date();
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(createdAt.getDate() + trialDays);
      const expiresAtISO = expiresAt.toISOString();

      const updatePayload = {
        account_type: selectedType,
        plan_status: 'trial', 
        plan_expires_at: expiresAtISO,
        trial_end_date: expiresAtISO
      };

      if (plan) updatePayload.current_plan_id = plan.id;

      const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            name: user.user_metadata?.name || 'Usuário',
            ...updatePayload
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      await onComplete(selectedType);
      
      toast({
        title: "Bem-vindo!",
        description: "Sua conta foi configurada com sucesso.",
      });
    } catch (error) {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-10 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row h-full max-h-[850px]">
        
        {/* Left Panel */}
        <div className="w-full md:w-[40%] bg-slate-950 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-lime-500/10 via-transparent to-blue-500/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-12">
              <Logo theme="dark" size="lg" />
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6 tracking-tight">
              Sua nova jornada <span className="text-lime-400">financeira</span> começa aqui.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Prepare-se para ter o controle total da sua vida ou do seu agronegócio com inteligência e simplicidade.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-12">
             <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-lime-400" />
             </div>
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Segurança Bancária de Ponta</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[60%] p-10 lg:p-20 overflow-y-auto custom-scrollbar">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Passo 01 / Configuração</span>
            </div>

            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Personalize seu acesso</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Selecione o perfil que melhor representa sua realidade atual para que possamos otimizar suas ferramentas.
            </p>

            <div className="space-y-4 mb-12">
              {accountTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ x: 5, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-lime-500 bg-lime-50/30' 
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/20' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-grow">
                        <h4 className={`text-lg font-black tracking-tight ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>
                          {type.title}
                        </h4>
                        <p className={`text-sm font-medium leading-snug mt-0.5 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                          {type.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button 
              onClick={handleContinue} 
              disabled={!selectedType || loading}
              className="btn-premium w-full py-8 text-lg group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Configurando Sistema...
                </>
              ) : (
                <>
                  Finalizar Configuração
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
              Você poderá alterar seu perfil a qualquer momento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;