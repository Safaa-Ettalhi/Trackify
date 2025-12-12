import { useState, useEffect } from 'react';
import { Wrench, Edit, Plus, Calendar, Truck, Package } from 'lucide-react';
import api from '../services/api';

const MaintenanceList = ({ onEdit, onCreate, refreshTrigger }) => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMaintenances();
  }, [refreshTrigger]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/maintenance');
      setMaintenances(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des maintenances');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      vidange: 'Vidange',
      revision: 'Révision',
      pneus: 'Pneus',
      autre: 'Autre'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      vidange: 'bg-blue-100 text-blue-700',
      revision: 'bg-purple-100 text-purple-700',
      pneus: 'bg-orange-100 text-orange-700',
      autre: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des maintenances...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de la Maintenance</h2>
          <p className="text-sm text-gray-500 mt-1">Planifiez et suivez les maintenances de votre flotte</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une maintenance</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {maintenances.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Périodicité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenances.map((maintenance) => (
                  <tr key={maintenance._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(maintenance.type)}`}>
                        <Wrench className="w-3 h-3 mr-1" />
                        {getTypeLabel(maintenance.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {maintenance.vehiculeType === 'camion' ? (
                          <Truck className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-900">
                          {getVehiculeTypeLabel(maintenance.vehiculeType)} #{maintenance.vehiculeId?.slice(-6) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {maintenance.periodiciteKm && (
                        <div className="flex items-center space-x-1">
                          <span>{maintenance.periodiciteKm.toLocaleString()} km</span>
                        </div>
                      )}
                      {maintenance.periodiciteJours && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{maintenance.periodiciteJours} jours</span>
                        </div>
                      )}
                      {!maintenance.periodiciteKm && !maintenance.periodiciteJours && (
                        <span className="text-gray-400">Non défini</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(maintenance.derniereMaintenance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(maintenance.prochaineMaintenance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(maintenance)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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
            <Wrench className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune maintenance enregistrée</h3>
          <p className="text-gray-500 mb-4">Commencez par créer une règle de maintenance</p>
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ajouter une maintenance
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;

