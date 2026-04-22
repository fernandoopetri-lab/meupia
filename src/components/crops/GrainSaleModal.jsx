import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Package, Warehouse, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const GrainSaleModal = ({ user, stockItem, onClose, onSaleSuccess }) => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity_sold: '',
    price_per_unit: '',
    buyer: '',
    discounts: '0',
    destination_wallet_id: '',
    sale_date: new Date().toISOString().split('T')[0],
  });
  const [grossValue, setGrossValue] = useState(0);
  const [netValue, setNetValue] = useState(0);

  useEffect(() => {
    const fetchWallets = async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name')
        .eq('user_id', user.id)
        .neq('type', 'credit'); // Can't receive money on credit card

      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar as carteiras.", variant: "destructive" });
      } else {
        setWallets(data || []);
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, destination_wallet_id: data[0].id }));
        }
      }
    };
    fetchWallets();
  }, [user.id, toast]);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity_sold) || 0;
    const price = parseFloat(formData.price_per_unit) || 0;
    const discount = parseFloat(formData.discounts) || 0;
    const gross = quantity * price;
    const net = gross - discount;
    setGrossValue(gross);
    setNetValue(net);
  }, [formData.quantity_sold, formData.price_per_unit, formData.discounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const quantitySold = parseFloat(formData.quantity_sold);
    if (!quantitySold || quantitySold <= 0) {
      toast({ title: "Erro de Validação", description: "A quantidade a vender deve ser maior que zero.", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (quantitySold > stockItem.quantity) {
      toast({ title: "Erro de Validação", description: "A quantidade a vender não pode ser maior que o estoque disponível.", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!formData.destination_wallet_id) {
      toast({ title: "Erro de Validação", description: "Selecione uma carteira de destino.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.rpc('process_grain_sale', {
      p_user_id: user.id,
      p_silo_id: stockItem.silo_id,
      p_grain_type: stockItem.grain_type,
      p_sale_date: formData.sale_date,
      p_quantity_sold: quantitySold,
      p_unit: stockItem.unit,
      p_price_per_unit: parseFloat(formData.price_per_unit) || 0,
      p_buyer: formData.buyer,
      p_discounts: parseFloat(formData.discounts) || 0,
      p_gross_value: grossValue,
      p_net_value: netValue,
      p_destination_wallet_id: parseInt(formData.destination_wallet_id),
      p_stock_id: stockItem.id,
    });

    if (error) {
      toast({ title: "Erro ao processar venda", description: error.message, variant: "destructive" });
      console.error("Grain sale error:", error);
    } else {
      toast({ title: "Sucesso!", description: "Venda de grãos registrada com sucesso." });
      onSaleSuccess();
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Vender Grãos</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg mb-4 flex items-center gap-4">
          <Package className="w-8 h-8 text-amber-600" />
          <div>
            <p className="font-bold text-lg text-slate-800">{stockItem.grain_type}</p>
            <p className="text-sm text-slate-500">
              Estoque atual: <span className="font-semibold">{stockItem.quantity.toLocaleString('pt-BR')} {stockItem.unit}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade a Vender ({stockItem.unit})*</label>
              <input type="number" name="quantity_sold" value={formData.quantity_sold} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preço por {stockItem.unit}*</label>
              <input type="number" name="price_per_unit" value={formData.price_per_unit} onChange={handleChange} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Comprador</label>
            <input type="text" name="buyer" value={formData.buyer} onChange={handleChange} placeholder="Nome do comprador" className="input-field" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descontos (R$)</label>
              <input type="number" name="discounts" value={formData.discounts} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data da Venda*</label>
              <input type="date" name="sale_date" value={formData.sale_date} onChange={handleChange} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Carteira de Destino*</label>
            <select name="destination_wallet_id" value={formData.destination_wallet_id} onChange={handleChange} className="input-field" required>
              <option value="">Selecione uma carteira</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Valor Bruto:</span>
              <span className="font-semibold text-slate-800">{grossValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Descontos:</span>
              <span className="font-semibold text-red-600">- {(parseFloat(formData.discounts) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-800">Valor Líquido:</span>
              <span className="text-emerald-600">{netValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </form>

        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirmar Venda
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GrainSaleModal;