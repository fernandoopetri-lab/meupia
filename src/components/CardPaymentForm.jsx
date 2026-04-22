import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { supabase } from '@/lib/customSupabaseClient';

const CardPaymentForm = ({ onSubmit, isLoading, type }) => {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    ccv: ''
  });
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateField = async (name, value) => {
    // Simple local pre-validation
    let error = null;
    if (name === 'cardholderName' && !value.trim()) error = 'Nome é obrigatório';
    if (name === 'cardNumber' && value.replace(/\D/g, '').length < 16) error = 'Número incompleto';
    if (name === 'expiryDate' && value.length < 5) error = 'Data incompleta';
    if (name === 'ccv' && value.length < 3) error = 'Inválido';

    if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        return false;
    }
    return true;
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidating(true);
    
    // Validate all locally first
    const newErrors = {};
    if (!formData.cardholderName.trim()) newErrors.cardholderName = 'Nome obrigatório';
    if (formData.cardNumber.replace(/\D/g, '').length < 13) newErrors.cardNumber = 'Número inválido';
    if (formData.expiryDate.length < 5) newErrors.expiryDate = 'Data inválida';
    if (formData.ccv.length < 3) newErrors.ccv = 'CVV inválido';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setValidating(false);
        return;
    }

    // Call server-side validation
    try {
        const { data: validationResult, error } = await supabase.functions.invoke('validate-checkout-data', {
            body: { 
                payment_method: type, // 'credit_card' or 'debit_card'
                card_data: {
                    number: formData.cardNumber.replace(/\D/g, ''),
                    holderName: formData.cardholderName,
                    expiryMonth: formData.expiryDate.split('/')[0],
                    expiryYear: formData.expiryDate.split('/')[1],
                    ccv: formData.ccv
                }
            }
        });

        if (error) {
            // Handle non-JSON response (HTML error page from edge function)
            if (typeof error === 'string' && error.trim().startsWith('<')) {
                throw new Error("Erro de comunicação com o servidor de validação.");
            }
            throw error;
        }

        if (!validationResult) {
             throw new Error("Resposta inválida da validação.");
        }

        if (!validationResult.valid) {
            const serverErrors = {};
            if (validationResult.errors) {
                validationResult.errors.forEach(err => {
                    // Map server errors to fields roughly
                    if (err.includes('number')) serverErrors.cardNumber = err;
                    else if (err.includes('expiry')) serverErrors.expiryDate = err;
                    else if (err.includes('cvv') || err.includes('ccv')) serverErrors.ccv = err;
                    else if (err.includes('name')) serverErrors.cardholderName = err;
                    else serverErrors.general = err;
                });
            } else {
                serverErrors.general = "Cartão inválido.";
            }
            setErrors(serverErrors);
            setValidating(false);
            return;
        }

        // Proceed if valid
        onSubmit({
            card_number: formData.cardNumber.replace(/\D/g, ''),
            expiry: formData.expiryDate,
            cvv: formData.ccv,
            cardholder_name: formData.cardholderName
        });

    } catch (err) {
        console.error("Validation error:", err);
        setErrors({ general: "Erro ao validar cartão. Verifique os dados ou tente novamente." });
    } finally {
        setValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="space-y-2">
        <Label htmlFor="cardholderName" className="text-gray-300">Nome no Cartão</Label>
        <Input
          id="cardholderName"
          name="cardholderName"
          placeholder="COMO NO CARTÃO"
          value={formData.cardholderName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`bg-gray-900 border-gray-700 text-white uppercase ${errors.cardholderName ? 'border-red-500' : ''}`}
        />
        {errors.cardholderName && <span className="text-xs text-red-400">{errors.cardholderName}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-gray-300">Número do Cartão</Label>
        <div className="relative">
            <IMaskInput
                mask="0000 0000 0000 0000"
                value={formData.cardNumber}
                unmask={false}
                onAccept={(value) => setFormData(prev => ({ ...prev, cardNumber: value }))}
                className={`flex h-10 w-full rounded-md border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.cardNumber ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="0000 0000 0000 0000"
                name="cardNumber"
                onBlur={handleBlur}
            />
             <div className="absolute right-3 top-2.5 text-gray-500">
                 <Lock className="w-4 h-4" />
             </div>
        </div>
        {errors.cardNumber && <span className="text-xs text-red-400">{errors.cardNumber}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-gray-300">Validade</Label>
            <IMaskInput
                mask="00/00"
                value={formData.expiryDate}
                unmask={false}
                onAccept={(value) => setFormData(prev => ({ ...prev, expiryDate: value }))}
                className={`flex h-10 w-full rounded-md border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.expiryDate ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="MM/AA"
                name="expiryDate"
                onBlur={handleBlur}
            />
            {errors.expiryDate && <span className="text-xs text-red-400">{errors.expiryDate}</span>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="ccv" className="text-gray-300">CVV</Label>
            <IMaskInput
                mask="0000"
                value={formData.ccv}
                unmask={false}
                onAccept={(value) => setFormData(prev => ({ ...prev, ccv: value }))}
                className={`flex h-10 w-full rounded-md border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.ccv ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="123"
                name="ccv"
                onBlur={handleBlur}
            />
            {errors.ccv && <span className="text-xs text-red-400">{errors.ccv}</span>}
        </div>
      </div>

      {errors.general && (
        <div className="p-3 rounded-md bg-red-900/30 border border-red-500/30 text-red-200 text-sm">
            {errors.general}
        </div>
      )}

      <Button 
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold"
        disabled={isLoading || validating}
      >
        {isLoading || validating ? (
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {validating ? 'Validando...' : 'Processando...'}
            </>
        ) : (
            `Pagar com ${type === 'credit_card' ? 'Crédito' : 'Débito'}`
        )}
      </Button>
      
      <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Seus dados estão criptografados e seguros.
      </p>
    </form>
  );
};

export default CardPaymentForm;