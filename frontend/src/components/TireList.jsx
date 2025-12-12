import { useState, useEffect } from 'react';
import { Circle, Edit, Trash2, Plus, Truck, Package, Calendar } from 'lucide-react';
import api from '../services/api';

const TireList = ({ onEdit, onCreate, refreshTrigger }) => {
  const [tires, setTires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTires();
  }, [refreshTrigger]);

  const loadTires = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/tires');
      setTires(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des pneus');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pneu ?')) {
      return;
    }

    try {
      await api.delete(`/tires/${id}`);
      loadTires();
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const getEtatColor = (etat) => {
    switch(etat) {
      case 'neuf': return 'bg-green-100 text-green-700';
      case 'bon': return 'bg-blue-100 text-blue-700';
      case 'usure': return 'bg-orange-100 text-orange-700';
      case 'a_remplacer': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEtatLabel = (etat) => {
    switch(etat) {
      case 'neuf': return 'Neuf';
      case 'bon': return 'Bon';
      case 'usure': return 'Usure';
      case 'a_remplacer': return 'À remplacer';
      default: return etat;
    }
  };

  const getVehiculeTypeLabel = (type) => {
    return type === 'camion' ? 'Camion' : 'Remorque';
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des pneus...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Pneus</h2>
          <p className="text-sm text-gray-500 mt-1">Suivez l'état et l'usure des pneus de votre flotte</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un pneu</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {tires.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kilométrage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date installation</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tires.map((tire) => (
                  <tr key={tire._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{tire.reference}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {tire.vehiculeType === 'camion' ? (
                          <Truck className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {getVehiculeTypeLabel(tire.vehiculeType)} #{tire.vehiculeId?.slice(-6) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(tire.etat)}`}>
                        {getEtatLabel(tire.etat)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatNumber(tire.kilometrage)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tire.dateInstallation)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(tire)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tire._id)}
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
            <Circle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun pneu enregistré</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter un pneu à votre flotte</p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ajouter un pneu
          </button>
        </div>
      )}
    </div>
  );
};

export default TireList;

