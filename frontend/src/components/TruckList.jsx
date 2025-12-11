import { useState, useEffect } from 'react';
import { Truck, Edit, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

const TruckList = ({ onEdit, onCreate }) => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/trucks');
      setTrucks(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des camions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce camion ?')) {
      return;
    }

    try {
      await api.delete(`/trucks/${id}`);
      loadTrucks();
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };


  const getStatusColor = (etat) => {
    switch(etat) {
      case 'disponible': return 'bg-green-100 text-green-700';
      case 'en_route': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

 
  const getStatusLabel = (etat) => {
    switch(etat) {
      case 'disponible': return 'Disponible';
      case 'en_route': return 'En route';
      case 'maintenance': return 'En maintenance';
      default: return etat;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des camions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liste des Camions</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un camion</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tableau des camions */}
      {trucks.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Immatriculation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kilométrage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trucks.map((truck) => (
                  <tr key={truck._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{truck.immatriculation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{truck.marque}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{truck.modele}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {truck.kilometrageTotal?.toLocaleString('fr-FR') || 0} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(truck.etat)}`}>
                        {getStatusLabel(truck.etat)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-start space-x-2">
                        <button
                          onClick={() => onEdit(truck)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(truck._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
            <Truck className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun camion enregistré</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premier camion</p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ajouter un camion
          </button>
        </div>
      )}
    </div>
  );
};

export default TruckList;