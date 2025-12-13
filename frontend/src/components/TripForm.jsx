import { useState, useEffect } from 'react';
import { Route, X } from 'lucide-react';
import api from '../services/api';

const TripForm = ({ trip, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    numero: '',
    lieuDepart: '',
    lieuArrivee: '',
    dateDepart: '',
    dateArriveePrevue: '',
    chauffeur: '',
    camion: '',
    remorque: '',
    statut: 'a_faire'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (trip) {
      setFormData({
        numero: trip.numero || '',
        lieuDepart: trip.lieuDepart || '',
        lieuArrivee: trip.lieuArrivee || '',
        dateDepart: trip.dateDepart ? new Date(trip.dateDepart).toISOString().slice(0, 16) : '',
        dateArriveePrevue: trip.dateArriveePrevue ? new Date(trip.dateArriveePrevue).toISOString().slice(0, 16) : '',
        chauffeur: trip.chauffeur?._id || trip.chauffeur || '',
        camion: trip.camion?._id || trip.camion || '',
        remorque: trip.remorque?._id || trip.remorque || '',
        statut: trip.statut || 'a_faire'
      });
    }
  }, [trip]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [usersRes, trucksRes, trailersRes] = await Promise.all([
        api.get('/auth/all'),
        api.get('/trucks'),
        api.get('/trailers')
      ]);

      const allDrivers = (usersRes.data.data || []).filter(user => user.role === 'chauffeur');
      
      setDrivers(allDrivers);
      setTrucks(trucksRes.data.data || []);
      setTrailers(trailersRes.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
      const tripData = {
        ...formData,
        dateDepart: new Date(formData.dateDepart).toISOString(),
        dateArriveePrevue: formData.dateArriveePrevue ? new Date(formData.dateArriveePrevue).toISOString() : undefined,
        camion: formData.camion || undefined,
        remorque: formData.remorque || undefined
      };

      if (trip) {
        await api.put(`/trips/${trip._id}`, tripData);
      } else {
        await api.post('/trips', tripData);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Route className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {trip ? 'Modifier le trajet' : 'Nouveau trajet'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de trajet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ex: TRJ-2024-001"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de départ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lieuDepart"
                  value={formData.lieuDepart}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: Casablanca"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu d'arrivée <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lieuArrivee"
                  value={formData.lieuArrivee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: Marrakech"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="dateDepart"
                  value={formData.dateDepart}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'arrivée prévue
                </label>
                <input
                  type="datetime-local"
                  name="dateArriveePrevue"
                  value={formData.dateArriveePrevue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chauffeur <span className="text-red-500">*</span>
              </label>
              <select
                name="chauffeur"
                value={formData.chauffeur}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="">Sélectionner un chauffeur</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
              {drivers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Aucun chauffeur disponible. Créez d'abord des utilisateurs avec le rôle chauffeur.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camion
                </label>
                <select
                  name="camion"
                  value={formData.camion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Sélectionner un camion</option>
                  {trucks.map((truck) => (
                    <option key={truck._id} value={truck._id}>
                      {truck.immatriculation} - {truck.marque} {truck.modele}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remorque
                </label>
                <select
                  name="remorque"
                  value={formData.remorque}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Sélectionner une remorque</option>
                  {trailers.map((trailer) => (
                    <option key={trailer._id} value={trailer._id}>
                      #{trailer.numero} - {trailer.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : trip ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;