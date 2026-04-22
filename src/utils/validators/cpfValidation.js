import { supabase } from '@/lib/customSupabaseClient';
import { removeMask } from '@/utils/formatters/maskUtils';

export const checkCpfExists = async (cpf) => {
  if (!cpf) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf', cpf)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking CPF existence:", error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error("Exception checking CPF existence:", err);
    return false;
  }
};

export const validateCPF = (cpf) => {
  const cleanCPF = removeMask(cpf);
  
  if (!cleanCPF || cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};