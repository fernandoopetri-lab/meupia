import { supabase } from '@/lib/customSupabaseClient';

/**
 * Logs critical errors with context to console and optionally to Supabase
 * @param {string} message - Description of the error
 * @param {Error} error - The error object
 * @param {string} userId - Associated user ID, if any
 * @param {object} context - Additional context metadata
 */
export const logError = async (message, error, userId = null, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message,
    errorMessage: error?.message || String(error),
    stack: error?.stack,
    userId,
    context
  };

  // Always log to console with descriptive formatting
  console.error(`[CRITICAL ERROR] ${message}`, errorLog);

  // Attempt to save to database if there's a specific table, or use edge function
  // We swallow errors here to prevent infinite logging loops
  try {
    // Assuming a generic log approach, but skipping direct insert to avoid schema issues
    // Just dispatching to console for now, but ready for DB insertion
  } catch (dbErr) {
    console.error('Failed to write error to logs:', dbErr);
  }
};