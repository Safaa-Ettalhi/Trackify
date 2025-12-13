import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import MaintenanceList from '../../components/MaintenanceList';
import MaintenanceForm from '../../components/MaintenanceForm';

const Maintenance = () => {
  const { 
    handleCreateMaintenance, 
    handleEditMaintenance, 
    handleMaintenanceSuccess, 
    maintenanceListRefreshKey 
  } = useAdmin();
  
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const onCreate = () => {
    setSelectedMaintenance(null);
    setShowMaintenanceForm(true);
  };

  const onEdit = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowMaintenanceForm(true);
  };

  const onSuccess = () => {
    handleMaintenanceSuccess();
    setShowMaintenanceForm(false);
    setSelectedMaintenance(null);
  };

  return (
    <>
      <MaintenanceList 
        refreshTrigger={maintenanceListRefreshKey}
        onEdit={onEdit}
        onCreate={onCreate} 
      />
      {showMaintenanceForm && (
        <MaintenanceForm
          maintenance={selectedMaintenance}
          onClose={() => {
            setShowMaintenanceForm(false);
            setSelectedMaintenance(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default Maintenance;

