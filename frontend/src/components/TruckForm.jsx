import { useState, useEffect } from 'react';
import { Truck, X } from 'lucide-react';
import api from '../services/api';

const TruckForm = ({ truck, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    kilometrageTotal: 0,
    etat: 'disponible'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (truck) {
      setFormData({
        immatriculation: truck.immatriculation || '',
        marque: truck.marque || '',
        modele: truck.modele || '',
        kilometrageTotal: truck.kilometrageTotal || 0,
        etat: truck.etat || 'disponible'
      });
    } else {
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        kilometrageTotal: 0,
        etat: 'disponible'
      });
    }
  }, [truck]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'kilometrageTotal' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
        if (truck) {
            await api.put(`/trucks/${truck._id}`, formData);
          } else {
            await api.post('/trucks', formData);
          }
          onSuccess();
          onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {truck ? 'Modifier le camion' : 'Nouveau camion'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immatriculation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ex: 12345-A-45"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ex: Mercedes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modèle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ex: Actros"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilométrage total
              </label>
              <input
                type="number"
                name="kilometrageTotal"
                value={formData.kilometrageTotal}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État <span className="text-red-500">*</span>
              </label>
              <select
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="disponible">Disponible</option>
                <option value="en_route">En route</option>
                <option value="maintenance">En maintenance</option>
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
              {loading ? 'Enregistrement...' : truck ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckForm;