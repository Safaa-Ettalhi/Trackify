import { Route, MapPin, Calendar, Truck, Package, Fuel, Download, Edit } from 'lucide-react';

const TripCard = ({ trip, onUpdateStatus, onDownloadPDF, onEdit }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'termine': return 'bg-green-100 text-green-700';
      case 'a_faire': return 'bg-gray-100 text-gray-700';
      case 'annule': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'a_faire': return 'À faire';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'a_faire': return { value: 'en_cours', label: 'Démarrer' };
      case 'en_cours': return { value: 'termine', label: 'Terminer' };
      default: return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextStatus = getNextStatus(trip.statut);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
              <Route className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Trajet #{trip.numero}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(trip.statut)}`}>
                {getStatusLabel(trip.statut)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2 ml-13">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{trip.lieuDepart}</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">{trip.lieuArrivee}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus(trip._id, nextStatus.value)}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              {nextStatus.label}
            </button>
          )}
          <button
            onClick={() => onDownloadPDF(trip._id)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Télécharger PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(trip)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Date de départ</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(trip.dateDepart)}</p>
          </div>
        </div>

        {trip.dateArriveePrevue && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date d'arrivée prévue</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(trip.dateArriveePrevue)}</p>
            </div>
          </div>
        )}

        {trip.camion && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Camion</p>
              <p className="text-sm font-medium text-gray-900">{trip.camion.immatriculation}</p>
            </div>
          </div>
        )}

        {trip.remorque && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Remorque</p>
              <p className="text-sm font-medium text-gray-900">#{trip.remorque.numero}</p>
            </div>
          </div>
        )}

        {trip.kilometrageDepart && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Route className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kilométrage départ</p>
              <p className="text-sm font-medium text-gray-900">{trip.kilometrageDepart.toLocaleString('fr-FR')} km</p>
            </div>
          </div>
        )}

        {trip.kilometrageArrivee && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Route className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kilométrage arrivée</p>
              <p className="text-sm font-medium text-gray-900">{trip.kilometrageArrivee.toLocaleString('fr-FR')} km</p>
            </div>
          </div>
        )}

        {trip.volumeGasoil && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Volume gasoil</p>
              <p className="text-sm font-medium text-gray-900">{trip.volumeGasoil} L</p>
            </div>
          </div>
        )}
      </div>

      {trip.remarques && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Remarques</p>
          <p className="text-sm text-gray-900">{trip.remarques}</p>
        </div>
      )}
    </div>
  );
};

export default TripCard;