import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import TripList from '../../components/TripList';
import TripForm from '../../components/TripForm';

const Trips = () => {
  const { 
    handleCreateTrip, 
    handleEditTrip, 
    handleTripSuccess, 
    tripListRefreshKey 
  } = useAdmin();
  
  const [showTripForm, setShowTripForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const onCreate = () => {
    setSelectedTrip(null);
    setShowTripForm(true);
  };

  const onEdit = (trip) => {
    setSelectedTrip(trip);
    setShowTripForm(true);
  };

  const onSuccess = () => {
    handleTripSuccess();
    setShowTripForm(false);
    setSelectedTrip(null);
  };

  return (
    <>
      <TripList 
        refreshTrigger={tripListRefreshKey}
        onEdit={onEdit}
        onCreate={onCreate} 
      />
      {showTripForm && (
        <TripForm
          trip={selectedTrip}
          onClose={() => {
            setShowTripForm(false);
            setSelectedTrip(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default Trips;

