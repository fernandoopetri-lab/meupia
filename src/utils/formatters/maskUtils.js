export const removeMask = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

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
    return truncated
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    return truncated
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

export const formatPhone = formatWhatsApp;