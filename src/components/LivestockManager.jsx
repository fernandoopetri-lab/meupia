
import React, { useState } from 'react';
import AnimalList from '@/components/livestock/AnimalList';
import AnimalDetails from '@/components/livestock/AnimalDetails';
import BirthsList from '@/components/livestock/BirthsList';
import MilkProductionList from '@/components/livestock/MilkProductionList';
import FatteningList from '@/components/livestock/FatteningList';
import EventsList from '@/components/livestock/EventsList';
import LotList from '@/components/livestock/LotList';
import LotDetails from '@/components/livestock/LotDetails';
import AnimalPurchase from '@/components/livestock/AnimalPurchase';
import AnimalSale from '@/components/livestock/AnimalSale';
import { BarChart3 } from 'lucide-react';

const PlaceholderComponent = ({ title, icon: Icon }) => (
  <div className="text-center py-12 chart-container">
    <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-slate-600 mb-2">{title}</h3>
    <p className="text-slate-500 mb-6">Esta funcionalidade está em desenvolvimento.</p>
    <p className="text-sm text-slate-400">🚧 Você pode solicitar a implementação no próximo prompt! 🚀</p>
  </div>
);

const LivestockManager = ({ user, activeSubTab, onDataChange, setActiveTab }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [filterByLotId, setFilterByLotId] = useState(null);

  const handleSelectAnimal = (animalId) => {
    setSelectedAnimalId(animalId);
  };

  const handleBackToList = () => {
    setSelectedAnimalId(null);
  };
  
  const handleSelectLot = (lotId) => {
    setSelectedLotId(lotId);
    setActiveTab('livestock-lot-details');
  };

  const handleFilterByLot = (lotId) => {
    setFilterByLotId(lotId);
    setActiveTab('livestock-animals');
  };

  const handleClearLotFilter = () => {
    setFilterByLotId(null);
  };

  const handleBackToLotList = () => {
    setSelectedLotId(null);
    setActiveTab('livestock-lots');
  };

  const renderSubView = () => {
    if (activeSubTab === 'livestock-animals' && selectedAnimalId) {
      return <AnimalDetails user={user} animalId={selectedAnimalId} onBack={handleBackToList} onDataChange={onDataChange} />;
    }
    
    if (activeSubTab === 'livestock-lot-details' && selectedLotId) {
      return <LotDetails user={user} lotId={selectedLotId} onBack={handleBackToLotList} onDataChange={onDataChange} />;
    }

    switch (activeSubTab) {
      case 'livestock-animals':
        return <AnimalList user={user} onDataChange={onDataChange} onSelectAnimal={handleSelectAnimal} filterByLotId={filterByLotId} onClearLotFilter={handleClearLotFilter} />;
      case 'livestock-lots':
        return <LotList user={user} onDataChange={onDataChange} onSelectLot={handleSelectLot} onFilterByLot={handleFilterByLot} />;
      case 'livestock-purchase':
        return <AnimalPurchase user={user} onDataChange={onDataChange} />;
      case 'livestock-sale':
        return <AnimalSale user={user} onDataChange={onDataChange} />;
      case 'livestock-births':
        return <BirthsList user={user} onDataChange={onDataChange} />;
      case 'livestock-milk':
        return <MilkProductionList user={user} onDataChange={onDataChange} />;
      case 'livestock-fattening':
        return <FatteningList user={user} onDataChange={onDataChange} />;
      case 'livestock-events':
        return <EventsList user={user} onDataChange={onDataChange} />;
      case 'livestock-reports':
        return <PlaceholderComponent title="Relatórios do Rebanho" icon={BarChart3} />;
      default:
        return <AnimalList user={user} onDataChange={onDataChange} onSelectAnimal={handleSelectAnimal} filterByLotId={filterByLotId} onClearLotFilter={handleClearLotFilter} />;
    }
  };

  return (
    <div className="w-full">
      {/* 
        Removed nested <Routes> to eliminate routing conflicts with App.jsx. 
        Navigation is managed entirely by component state (activeSubTab).
      */}
      {renderSubView()}
    </div>
  );
};

export default LivestockManager;
