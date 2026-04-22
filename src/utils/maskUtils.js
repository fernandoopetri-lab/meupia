export const removeMask = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

// Alias for consistency
export const removePhoneMask = removeMask;

export const formatCPF = (value) => {
  const cleanValue = removeMask(value);
  if (!cleanValue) return '';
  
  const truncated = cleanValue.substring(0, 11);
  
  return truncated
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatWhatsApp = (value) => {
  const cleanValue = removeMask(value);
  if (!cleanValue) return '';
  
  const truncated = cleanValue.substring(0, 11);
  
  if (truncated.length <= 10) {
    // (XX) XXXX-XXXX
    return truncated
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // (XX) XXXXX-XXXX
    return truncated
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

// Alias for existing code compatibility
export const formatPhone = formatWhatsApp;

export const validateCPF = (cpf) => {
  const cleanCPF = removeMask(cpf);
  
  if (!cleanCPF || cleanCPF.length !== 11) return false;
  
  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  // Validate 1st digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Validate 2nd digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export const validateWhatsApp = (phone) => {
  const cleanPhone = removeMask(phone);
  // Validates if it has 10 or 11 digits
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Alias for existing code
export const validatePhoneFormat = validateWhatsApp;