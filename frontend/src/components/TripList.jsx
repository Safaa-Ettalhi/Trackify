import { useState, useEffect } from 'react';
import { Route, Edit, Trash2, Plus, Download, MapPin, Calendar, User, Truck, Package, Eye, X } from 'lucide-react';
import api from '../services/api';
import Pagination from './Pagination';

const TripList = ({ onEdit, onCreate, refreshTrigger }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadTrips();
  }, [refreshTrigger, pagination.page]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/trips', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setTrips(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 0
      }));
    } catch (err) {
      setError('Erreur lors du chargement des trajets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
      return;
    }

    try {
      await api.delete(`/trips/${id}`);
      if (trips.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadTrips();
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleDownloadPDF = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trajet-${tripId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };


  const getStatusColor = (statut) => {
    switch(statut) {
      case 'a_faire': return 'bg-gray-100 text-gray-700';
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'termine': return 'bg-green-100 text-green-700';
      case 'annule': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut) {
      case 'a_faire': return 'À faire';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des trajets...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liste des Trajets</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un trajet</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tableau des trajets */}
      {trips.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Itinéraire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date départ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50 ">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Route className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">#{trip.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{trip.lieuDepart}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-900">{trip.lieuArrivee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trip.chauffeur?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(trip.dateDepart)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.statut)}`}>
                        {getStatusLabel(trip.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-start space-x-2">
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg "
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(trip)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg "
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg "
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Route className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun trajet enregistré</h3>
          <p className="text-gray-500 mb-6">Commencez par créer votre premier trajet</p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 "
          >
            Créer un trajet
          </button>
        </div>
      )}
          {/* modal de details trjet */}
        {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTrip(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Route className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Détails du trajet #{selectedTrip.numero}</h2>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Lieu de départ</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTrip.lieuDepart}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Lieu d'arrivée</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTrip.lieuArrivee}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Date de départ</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedTrip.dateDepart)}</p>
                  </div>
                </div>
                {selectedTrip.dateArriveePrevue && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Date d'arrivée prévue</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedTrip.dateArriveePrevue)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Chauffeur</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{selectedTrip.chauffeur?.name || '-'}</p>
                  </div>
                  {selectedTrip.chauffeur?.email && (
                    <p className="text-xs text-gray-500 mt-1">{selectedTrip.chauffeur.email}</p>
                  )}
                </div>
                {selectedTrip.camion && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Camion</p>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{selectedTrip.camion.immatriculation}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedTrip.camion.marque} {selectedTrip.camion.modele}</p>
                  </div>
                )}
                {selectedTrip.remorque && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Remorque</p>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">#{selectedTrip.remorque.numero}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedTrip.remorque.type}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Statut</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedTrip.statut)}`}>
                  {getStatusLabel(selectedTrip.statut)}
                </span>
              </div>

              {(selectedTrip.kilometrageDepart || selectedTrip.kilometrageArrivee || selectedTrip.volumeGasoil) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedTrip.kilometrageDepart && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Kilométrage départ</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedTrip.kilometrageDepart.toLocaleString('fr-FR')} km</p>
                    </div>
                  )}
                  {selectedTrip.kilometrageArrivee && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Kilométrage arrivée</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedTrip.kilometrageArrivee.toLocaleString('fr-FR')} km</p>
                    </div>
                  )}
                  {selectedTrip.volumeGasoil && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Volume gasoil</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedTrip.volumeGasoil} L</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTrip.remarques && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Remarques</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTrip.remarques}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadPDF(selectedTrip._id)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTrip(null);
                    onEdit(selectedTrip);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TripList;