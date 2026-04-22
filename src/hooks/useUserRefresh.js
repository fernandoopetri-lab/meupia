import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useUserRefresh = (setUsers) => {
  const refetchUser = useCallback(async (userId) => {
    if (!userId) return;

    try {
      // Fetch the updated profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error refreshing user profile:", error);
        return;
      }

      // Update the users list with the new profile data
      // We merge the new profile with the existing user object to preserve auth fields (email, etc.)
      setUsers(currentUsers => 
        currentUsers.map(u => 
          u.id === userId ? { ...u, ...profile } : u
        )
      );

      return profile;
    } catch (err) {
      console.error("Unexpected error refreshing user:", err);
    }
  }, [setUsers]);

  return { refetchUser };
};