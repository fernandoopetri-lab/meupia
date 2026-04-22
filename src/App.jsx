
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import AppContent from '@/components/AppContent';
import LotAnimalsPage from '@/pages/LotAnimalsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/lot/:lotId" element={<LotAnimalsPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
