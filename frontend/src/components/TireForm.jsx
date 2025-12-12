import { useState, useEffect } from 'react';
import { Circle, X, Truck, Package } from 'lucide-react';
import api from '../services/api';

const TireForm = ({ tire, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    reference: '',
    etat: 'neuf',
    kilometrage: '',
    vehiculeType: 'camion',
    vehiculeId: '',
    dateInstallation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (!loadingData && tire) {
      let vehiculeIdString = '';
      if (tire.vehiculeId) {
        if (typeof tire.vehiculeId === 'object' && tire.vehiculeId._id) {
          vehiculeIdString = tire.vehiculeId._id.toString();
        } else if (typeof tire.vehiculeId === 'object') {
          vehiculeIdString = tire.vehiculeId.toString();
        } else {
          vehiculeIdString = String(tire.vehiculeId);
        }
      }
      
      setFormData({
        reference: tire.reference || '',
        etat: tire.etat || 'neuf',
        kilometrage: tire.kilometrage || '',
        vehiculeType: tire.vehiculeType || 'camion',
        vehiculeId: vehiculeIdString,
        dateInstallation: tire.dateInstallation 
          ? new Date(tire.dateInstallation).toISOString().split('T')[0]
          : ''
      });
    } else if (!tire && !loadingData) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        dateInstallation: today
      }));
    }
  }, [tire, loadingData]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [trucksRes, trailersRes] = await Promise.all([
        api.get('/trucks'),
        api.get('/trailers')
      ]);
      setTrucks(trucksRes.data.data || []);
      setTrailers(trailersRes.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vehiculeType') {
      const currentVehiculeId = formData.vehiculeId;
      const availableVehicles = value === 'camion' ? trucks : trailers;
      const vehiculeExists = availableVehicles.some(v => String(v._id) === String(currentVehiculeId));
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        vehiculeId: vehiculeExists ? currentVehiculeId : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tireData = {
        ...formData,
        kilometrage: formData.kilometrage ? Number(formData.kilometrage) : 0,
        dateInstallation: formData.dateInstallation || new Date(),
        vehiculeId: formData.vehiculeId || undefined
      };

      if (tire) {
        await api.put(`/tires/${tire._id}`, tireData);
      } else {
        await api.post('/tires', tireData);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = formData.vehiculeType === 'camion' ? trucks : trailers;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <Circle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {tire ? 'Modifier le pneu' : 'Nouveau pneu'}
              </h2>
              <p className="text-sm text-gray-500">Associez un pneu à un véhicule</p>
            </div>
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence du pneu *
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ex: MICHELIN 225/65R17"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de véhicule *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, vehiculeType: 'camion', vehiculeId: '' }));
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 border-2 rounded-lg transition-all ${
                    formData.vehiculeType === 'camion'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span className="font-medium">Camion</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, vehiculeType: 'remorque', vehiculeId: '' }));
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 border-2 rounded-lg transition-all ${
                    formData.vehiculeType === 'remorque'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Remorque</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associer au véhicule *
              </label>
              <select
                name="vehiculeId"
                value={formData.vehiculeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="">Choisir un véhicule</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {formData.vehiculeType === 'camion' 
                      ? `${vehicle.immatriculation} - ${vehicle.marque} ${vehicle.modele}`
                      : `${vehicle.numero} - ${vehicle.type}`
                    }
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État du pneu *
              </label>
              <select
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="neuf">Neuf</option>
                <option value="bon">Bon</option>
                <option value="usure">Usure</option>
                <option value="a_remplacer">À remplacer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilométrage
                </label>
                <input
                  type="number"
                  name="kilometrage"
                  value={formData.kilometrage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: 50000"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'installation
                </label>
                <input
                  type="date"
                  name="dateInstallation"
                  value={formData.dateInstallation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : tire ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TireForm;

