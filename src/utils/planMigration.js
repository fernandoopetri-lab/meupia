import { supabase } from '@/lib/customSupabaseClient';

/**
 * Helper utilities for Plan Management and Migration
 */

// Fetch the default plan ID from system settings
export const getDefaultPlan = async () => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'default_plan_id')
      .single();

    if (error || !settings) {
      console.warn('Could not fetch default plan setting:', error);
      // Fallback: try to find a trial plan
      const { data: trialPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('plan_type', 'trial')
        .eq('status', 'active')
        .limit(1)
        .single();
      
      return trialPlan || null;
    }

    // Return the plan details for that ID
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', settings.value)
      .single();

    if (planError) throw planError;
    return plan;
  } catch (err) {
    console.error('Error getting default plan:', err);
    return null;
  }
};

// Fetch system configured trial duration
export const getTrialDurationDays = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'trial_duration_days')
      .single();

    if (error || !data) return 14; // Default fallback
    return parseInt(data.value, 10) || 14;
  } catch (err) {
    console.error('Error fetching trial duration:', err);
    return 14;
  }
};

// Get a plan by its internal type string (backward compatibility)
export const getPlanByType = async (type) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('plan_type', type)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
};

// Check if a user has access to a specific feature flag
export const checkFeatureAccess = (plan, featureKey) => {
  if (!plan || !plan.access_rules) return false;
  return !!plan.access_rules[featureKey];
};