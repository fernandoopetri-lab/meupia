
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const AnimalList = ({ user, onSelectAnimal, filterByLotId, onClearLotFilter }) => {
  const { toast } = useToast();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [statusFilter, setStatusFilter] = useState({
    'ativo': true,
    'vendido': false,
    'morto': false,
    'quarentena': true,
  });
  const [lotName, setLotName] = useState('');

  const fetchAnimals = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    
    // Using direct lot_id mapping to livestock_lots table
    let query = supabase
      .from('livestock')
      .select(`
        id,
        ear_tag_id,
        breed,
        sex,
        birth_date,
        status,
        properties ( name ),
        lot_id,
        livestock_lots:lot_id ( name )
      `)
      .eq('user_id', user.id);

    if (filterByLotId) {
      query = query.eq('lot_id', filterByLotId);
      const { data: lotData, error: lotError } = await supabase.from('livestock_lots').select('name').eq('id', filterByLotId).single();
      if (!lotError && lotData) setLotName(lotData.name);
    } else {
        setLotName('');
    }
      
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os animais.", variant: "destructive" });
      setAnimals([]);
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  }, [user?.id, toast, filterByLotId]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const filteredAnimals = useMemo(() => {
    return animals
      .filter(animal => {
        const searchLower = searchTerm.toLowerCase();
        // Since we fetch `livestock_lots:lot_id ( name )`, it comes back as `livestock_lots` object
        const currentLotName = animal.livestock_lots?.name || '';

        return (
          (animal.ear_tag_id?.toLowerCase().includes(searchLower) ||
           animal.breed?.toLowerCase().includes(searchLower) ||
           animal.properties?.name?.toLowerCase().includes(searchLower) ||
           currentLotName.toLowerCase().includes(searchLower)) &&
           statusFilter[animal.status]
        );
      });
  }, [animals, searchTerm, statusFilter]);

  const paginatedAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnimals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnimals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const statusOptions = ['ativo', 'vendido', 'morto', 'quarentena'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-100 text-emerald-700';
      case 'vendido': return 'bg-blue-100 text-blue-700';
      case 'morto': return 'bg-red-100 text-red-700';
      case 'quarentena': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 text-lime-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {filterByLotId && (
          <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-3 rounded-lg">
              <p className="font-semibold">Filtrando por lote: <span className="font-bold">{lotName}</span></p>
              <Button variant="ghost" size="sm" onClick={onClearLotFilter} className="flex items-center gap-2 text-blue-700 hover:bg-blue-100">
                  <XCircle className="w-4 h-4" />
                  Limpar Filtro
              </Button>
          </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Buscar por brinco, raça, lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtrar Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status do Animal</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter[status]}
                onCheckedChange={() => handleStatusFilterChange(status)}
                className="capitalize"
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {paginatedAnimals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedAnimals.map((animal, index) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectAnimal(animal.id)}
                className="wallet-card group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                    <GitCommit className="w-6 h-6 text-green-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(animal.status)}`}>
                    {animal.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">Brinco: {animal.ear_tag_id}</h3>
                <p className="text-sm text-slate-500 capitalize">{animal.breed || 'Raça não definida'}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p><strong>Sexo:</strong> <span className="capitalize">{animal.sex || 'N/D'}</span></p>
                  <p><strong>Lote:</strong> {animal.livestock_lots?.name || 'Sem lote'}</p>
                  <p><strong>Propriedade:</strong> {animal.properties?.name || 'N/D'}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-slate-500">
              Mostrando {paginatedAnimals.length} de {filteredAnimals.length} animais
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 wallet-card">
          <GitCommit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum animal encontrado</h3>
          <p className="text-slate-500">Nenhum animal corresponde aos filtros selecionados ou você ainda não cadastrou animais.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AnimalList;
