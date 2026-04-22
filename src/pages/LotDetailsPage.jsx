
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, Calendar, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import AnimalsByLotList from '@/components/livestock/AnimalsByLotList';

const LotDetailsPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotDetails = async () => {
      if (!user || !lotId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock_lots')
        .select('*')
        .eq('id', lotId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({ title: "Erro", description: "Lote não encontrado.", variant: "destructive" });
        navigate('/livestock', { replace: true });
      } else {
        setLot(data);
      }
      setLoading(false);
    };

    fetchLotDetails();
  }, [lotId, user, navigate, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500">Carregando detalhes do lote...</p>
      </div>
    );
  }

  if (!lot) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="text-slate-500 hover:text-slate-800 pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Lotes
      </Button>

      <div className="chart-container border-t-4 border-t-emerald-500">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{lot.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {lot.description && (
                <div className="flex items-start text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <Info className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm">{lot.description}</span>
                </div>
              )}
              <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg">
                <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                <span className="text-sm">
                  Criado em: <strong className="text-slate-700">{new Date(lot.created_at).toLocaleDateString('pt-BR')}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimalsByLotList user={user} lotId={lot.id} />
    </motion.div>
  );
};

export default LotDetailsPage;
