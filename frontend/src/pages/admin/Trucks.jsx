import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import TruckList from '../../components/TruckList';
import TruckForm from '../../components/TruckForm';

const Trucks = () => {
  const { 
    handleCreateTruck, 
    handleEditTruck, 
    handleTruckSuccess, 
    truckListRefreshKey 
  } = useAdmin();
  
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const onCreate = () => {
    setSelectedTruck(null);
    setShowTruckForm(true);
  };

  const onEdit = (truck) => {
    setSelectedTruck(truck);
    setShowTruckForm(true);
  };

  const onSuccess = () => {
    handleTruckSuccess();
    setShowTruckForm(false);
    setSelectedTruck(null);
  };

  return (
    <>
      <TruckList 
        refreshTrigger={truckListRefreshKey}
        onEdit={onEdit}
        onCreate={onCreate} 
      />
      {showTruckForm && (
        <TruckForm
          truck={selectedTruck}
          onClose={() => {
            setShowTruckForm(false);
            setSelectedTruck(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default Trucks;

