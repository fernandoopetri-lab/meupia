import { invokeEdgeFunction } from './edgeFunctionHelper';
import { logError } from './errorLogger';

/**
 * Invokes the backend edge function to validate and update the user's access status.
 * Returns a detailed status object.
 * 
 * @param {string} userId - The user's UUID
 * @returns {Promise<{allowed: boolean, status: string, reason: string, expiresAt: string}>}
 */
export const checkAccessStatus = async (userId) => {
  if (!userId) {
    console.warn('checkAccessStatus called without userId');
    return { allowed: false, status: 'error', reason: 'User ID missing', expiresAt: null };
  }
  
  try {
    const { data, error } = await invokeEdgeFunction('check-user-access', {
      body: { userId }
    });
    
    if (error) {
      logError('Error invoking check-user-access', error, userId);
      return { allowed: true, status: 'unknown', reason: 'Error checking access', expiresAt: null };
    }

    return {
      allowed: data?.allowed ?? true,
      status: data?.status || 'active',
      reason: data?.reason || '',
      expiresAt: data?.expiresAt || null
    };
  } catch (err) {
    logError('Unexpected error in checkAccessStatus', err, userId);
    return { allowed: true, status: 'unknown', reason: 'Unexpected error', expiresAt: null };
  }
};

/**
 * Checks the user's access status based on profile data for frontend UI.
 * 
 * @param {Object} profile - The user profile object
 * @returns {Object} Access status object
 */
export const checkUserAccess = (profile) => {
  if (!profile) {
    return { allowed: false, status: 'unknown', reason: 'Perfil não encontrado', daysLeft: 0, type: 'unknown' };
  }

  if (profile.is_admin) {
    return { allowed: true, status: 'active', reason: 'Administrador', daysLeft: 365, type: 'admin' };
  }

  if (profile.access_status === 'blocked') {
    return { 
      allowed: false, 
      status: 'blocked', 
      reason: profile.access_reason || 'Acesso bloqueado pelo administrador.',
      daysLeft: 0,
      type: 'blocked'
    };
  }

  if (profile.plan_status === 'trial') {
    const expiresAt = new Date(profile.trial_end_date || profile.plan_expires_at);
    const now = new Date();
    const diffDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        allowed: false, 
        status: 'trial_expired', 
        reason: 'Seu período de teste expirou. Assine um plano para continuar.',
        daysLeft: 0,
        type: 'trial'
      };
    }

    return { allowed: true, status: 'trial', reason: null, daysLeft: diffDays, type: 'trial' };
  }

  if (profile.plan_status === 'active') {
    if (profile.payment_status === 'overdue' && profile.access_status === 'restricted') {
        const graceEnd = new Date(profile.grace_period_ends_at);
        const graceDiff = Math.ceil((graceEnd - new Date()) / (1000 * 60 * 60 * 24));
        return { allowed: true, status: 'restricted', reason: 'Pagamento pendente. Período de graça ativo.', daysLeft: graceDiff, type: 'subscription' };
    }
    
    let daysLeft = 30;
    if (profile.next_billing_date) {
        daysLeft = Math.ceil((new Date(profile.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
    }
    return { allowed: true, status: 'active', reason: null, daysLeft, type: 'subscription' };
  }
  
  if (profile.plan_status === 'cancelled') {
      return { allowed: false, status: 'cancelled', reason: 'Sua assinatura foi cancelada.', daysLeft: 0, type: 'subscription' };
  }

  return { allowed: true, status: 'active', reason: null, daysLeft: 0, type: 'unknown' };
};

export const checkExpirationWarning = (profile) => {
    if (!profile || profile.is_admin) return null;
    const accessInfo = checkUserAccess(profile);
    
    if (accessInfo.type === 'trial' && accessInfo.daysLeft <= 7 && accessInfo.daysLeft >= 0) {
        return { type: 'trial', daysLeft: accessInfo.daysLeft, message: `Seu teste expira em ${accessInfo.daysLeft} dias.` };
    }
    if (accessInfo.status === 'restricted') {
        return { type: 'payment', daysLeft: accessInfo.daysLeft, message: `Pagamento pendente. Acesso bloqueado em ${accessInfo.daysLeft} dias.` };
    }
    return null;
};