
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Hash, Scale, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LotAnimalsPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [animals, setAnimals] = useState([]);
  const [lotDetails, setLotDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnimals = useCallback(async () => {
    if (!user || !lotId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch lot details for header
      const { data: lotData, error: lotError } = await supabase
        .from('livestock_lots')
        .select('name')
        .eq('id', lotId)
        .eq('user_id', user.id)
        .single();
        
      if (lotError) throw lotError;
      setLotDetails(lotData);

      // Fetch animals in this lot
      const { data: animalsData, error: animalsError } = await supabase
        .from('livestock')
        .select('*')
        .eq('lot_id', lotId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (animalsError) throw animalsError;
      setAnimals(animalsData || []);
      
    } catch (err) {
      console.error("Error fetching lot animals:", err);
      setError("Não foi possível carregar os animais deste lote.");
      toast({
        title: "Erro",
        description: "Falha ao carregar os dados do lote.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [lotId, user, toast]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ativo': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'vendido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'morto': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    const diffMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (diffMonths < 1) return 'Menos de 1 mês';
    if (diffMonths < 12) return `${diffMonths} meses`;
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    return `${years} anos${remainingMonths > 0 ? ` e ${remainingMonths} meses` : ''}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium">Carregando animais do lote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-400" />
        <h2 className="text-xl font-bold text-slate-800">Ops! Algo deu errado.</h2>
        <p className="text-slate-500">{error}</p>
        <div className="flex space-x-4 mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
          <Button onClick={fetchAnimals} className="btn-primary">Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {lotDetails ? `Animais do Lote: ${lotDetails.name}` : 'Detalhes do Lote'}
            </h1>
            <p className="text-sm text-slate-500">
              Total de {animals.length} animal(is) vinculado(s)
            </p>
          </div>
        </div>
      </div>

      {animals.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold">Identificação (Brinco)</th>
                  <th className="p-4 font-semibold">Raça / Sexo</th>
                  <th className="p-4 font-semibold">Nascimento / Idade</th>
                  <th className="p-4 font-semibold">Peso Atual</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animals.map((animal) => {
                  const lastWeight = animal.weight_history && animal.weight_history.length > 0 
                    ? animal.weight_history[animal.weight_history.length - 1].weight 
                    : null;

                  return (
                    <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center font-bold text-slate-800">
                          <Hash className="w-4 h-4 mr-2 text-slate-400" />
                          {animal.ear_tag_id}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-700 capitalize">{animal.breed || 'Não informada'}</p>
                        <p className="text-xs text-slate-500 capitalize">{animal.sex || 'Não informado'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm text-slate-700">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          {animal.birth_date ? new Date(animal.birth_date).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-6">{calculateAge(animal.birth_date)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm font-medium text-slate-700">
                          <Scale className="w-4 h-4 mr-2 text-slate-400" />
                          {lastWeight ? `${lastWeight} kg` : 'Sem registro'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(animal.status)}`}>
                          {animal.status?.toUpperCase() || 'DESCONHECIDO'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum animal neste lote</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Não encontramos nenhum animal vinculado a este lote. Você pode adicionar animais acessando o gerenciador de rebanho.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Voltar para Lotes
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default LotAnimalsPage;
