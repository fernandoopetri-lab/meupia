import { supabase } from '@/lib/customSupabaseClient';

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