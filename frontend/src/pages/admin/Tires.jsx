import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import TireList from '../../components/TireList';
import TireForm from '../../components/TireForm';

const Tires = () => {
  const { 
    handleCreateTire, 
    handleEditTire, 
    handleTireSuccess, 
    tireListRefreshKey 
  } = useAdmin();
  
  const [showTireForm, setShowTireForm] = useState(false);
  const [selectedTire, setSelectedTire] = useState(null);

  const onCreate = () => {
    setSelectedTire(null);
    setShowTireForm(true);
  };

  const onEdit = (tire) => {
    setSelectedTire(tire);
    setShowTireForm(true);
  };

  const onSuccess = () => {
    handleTireSuccess();
    setShowTireForm(false);
    setSelectedTire(null);
  };

  return (
    <>
      <TireList 
        refreshTrigger={tireListRefreshKey}
        onEdit={onEdit}
        onCreate={onCreate} 
      />
      {showTireForm && (
        <TireForm
          tire={selectedTire}
          onClose={() => {
            setShowTireForm(false);
            setSelectedTire(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default Tires;

