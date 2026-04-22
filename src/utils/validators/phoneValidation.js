import { removeMask } from '@/utils/formatters/maskUtils';

export const validateWhatsApp = (phone) => {
  const cleanPhone = removeMask(phone);
  
  // Must be 10 or 11 digits
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return false;
  }
  
  // Basic Brazilian area code check (11 to 99)
  const areaCode = parseInt(cleanPhone.substring(0, 2), 10);
  if (areaCode < 11 || areaCode > 99) {
    return false;
  }
  
  return true;
};

export const validatePhoneFormat = validateWhatsApp;