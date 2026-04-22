import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzpcjscvptmgoyelyzov.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cGNqc2N2cHRtZ295ZWx5em92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTUxODcsImV4cCI6MjA3NDMzMTE4N30.DbJ_ONNkjdp2MIIsUJJMEbAfakORdrNFWFC183NND1c';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
