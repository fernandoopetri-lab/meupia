import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AccessRestrictedModal from './AccessRestrictedModal';
import { Loader2 } from 'lucide-react';

const ProtectedAccessRoute = ({ children }) => {
  const { accessStatus, loading, user } = useAuth();

  // If auth is loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // If no user, return null (App.jsx handles redirect)
  if (!user) {
    return null; 
  }

  // If access is explicitly denied
  if (accessStatus && accessStatus.allowed === false) {
    return (
      <AccessRestrictedModal 
        status={accessStatus.status} 
        reason={accessStatus.reason} 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedAccessRoute;