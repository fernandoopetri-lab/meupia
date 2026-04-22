import { supabase } from '@/lib/customSupabaseClient';

/**
 * Logs an administrative action to the admin_audit_logs table.
 * 
 * @param {string} adminUserId - The UUID of the admin performing the action
 * @param {string} action - The action slug (e.g., 'block_user', 'change_plan')
 * @param {string} targetUserId - The UUID of the user being affected (can be null if user was deleted)
 * @param {object} details - JSON object containing additional details about the action
 */
export const logAdminAction = async (adminUserId, action, targetUserId, details = {}) => {
  if (!adminUserId) {
    console.warn('logAdminAction called without adminUserId');
    return;
  }

  let finalTargetId = targetUserId;
  let finalDetails = { ...details };

  try {
    // If a target user ID is provided, validate it exists in profiles to prevent FK violation
    if (targetUserId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .maybeSingle();

      // If user doesn't exist (e.g. was just deleted) or error checking
      if (!data || error) {
        console.warn(`Target user ${targetUserId} not found in profiles. Logging with null target.`);
        finalTargetId = null;
        finalDetails.original_target_id = targetUserId;
        finalDetails.target_lookup_status = error ? 'error' : 'not_found';
      }
    }

    const { error: insertError } = await supabase.from('admin_audit_logs').insert({
      admin_user_id: adminUserId,
      action,
      target_user_id: finalTargetId,
      details: finalDetails
    });

    if (insertError) {
      console.error('Error logging admin action:', insertError);
    }
  } catch (err) {
    console.error('Unexpected error in logAdminAction:', err);
  }
};