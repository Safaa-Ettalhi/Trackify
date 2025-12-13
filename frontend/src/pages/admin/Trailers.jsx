import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import TrailerList from '../../components/TrailerList';
import TrailerForm from '../../components/TrailerForm';

const Trailers = () => {
  const { 
    handleCreateTrailer, 
    handleEditTrailer, 
    handleTrailerSuccess, 
    trailerListRefreshKey 
  } = useAdmin();
  
  const [showTrailerForm, setShowTrailerForm] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  const onCreate = () => {
    setSelectedTrailer(null);
    setShowTrailerForm(true);
  };

  const onEdit = (trailer) => {
    setSelectedTrailer(trailer);
    setShowTrailerForm(true);
  };

  const onSuccess = () => {
    handleTrailerSuccess();
    setShowTrailerForm(false);
    setSelectedTrailer(null);
  };

  return (
    <>
      <TrailerList 
        refreshTrigger={trailerListRefreshKey}
        onEdit={onEdit}
        onCreate={onCreate} 
      />
      {showTrailerForm && (
        <TrailerForm
          trailer={selectedTrailer}
          onClose={() => {
            setShowTrailerForm(false);
            setSelectedTrailer(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default Trailers;

