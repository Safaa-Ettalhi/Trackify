import { useState, useEffect } from 'react';
import { Wrench, Edit, Plus, Calendar, Truck, Package, AlertTriangle, Check, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Pagination from './Pagination';

const MaintenanceList = ({ onEdit, onCreate, refreshTrigger }) => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState({});

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadMaintenances();
  }, [refreshTrigger, pagination.page]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/maintenance', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setMaintenances(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 0
      }));
    } catch (err) {
      setError('Erreur lors du chargement des maintenances');
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

  const getMaintenanceStatus = (maintenance) => {
    if (!maintenance.notificationStatus) return null;
    
    const status = maintenance.notificationStatus;
    if (status === 'depassee') {
      return { label: 'DÉPASSÉE', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (status === 'urgente') {
      return { label: 'URGENTE', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else if (status === 'a_venir') {
      return { label: 'À VENIR', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    }
    return null;
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkAsDone = async (maintenanceId) => {
    try {
      setMarkingDone(prev => ({ ...prev, [maintenanceId]: true }));
      
      const maintenance = maintenances.find(m => m._id === maintenanceId);
      const kilometrageEffectue = maintenance?.vehicle?.kilometrageTotal || null;
      
      await api.put(`/maintenance/${maintenanceId}/mark-done`, {
        dateEffectuee: new Date().toISOString(),
        kilometrageEffectue: kilometrageEffectue
      });
      
      await loadMaintenances();
    } catch (error) {
      console.error('Erreur lors du marquage comme effectuée:', error);
      alert('Erreur lors du marquage de la maintenance comme effectuée');
    } finally {
      setMarkingDone(prev => ({ ...prev, [maintenanceId]: false }));
    }
  };

  const getStatusBadge = (statut) => {
    if (statut === 'effectuee') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          EFFECTUÉE
        </span>
      );
    } else if (statut === 'annulee') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
          ANNULÉE
        </span>
      );
    }
    return null;
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Périodicité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenances.map((maintenance) => {
                  const statusInfo = getMaintenanceStatus(maintenance);
                  const daysUntil = maintenance.prochaineMaintenance ? getDaysUntil(maintenance.prochaineMaintenance) : null;
                  
                  return (
                  <tr 
                    key={maintenance._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      statusInfo ? `${statusInfo.bgColor} ${statusInfo.borderColor} border-l-4` : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(maintenance.type)}`}>
                          <Wrench className="w-3 h-3 mr-1" />
                          {getTypeLabel(maintenance.type)}
                        </span>
                        {getStatusBadge(maintenance.statut)}
                        {statusInfo && maintenance.statut !== 'effectuee' && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            statusInfo.color === 'red' 
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : statusInfo.color === 'orange'
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        )}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={statusInfo && statusInfo.color === 'red' ? 'text-red-700 font-semibold' : statusInfo && statusInfo.color === 'orange' ? 'text-orange-700 font-semibold' : 'text-gray-600'}>
                          {formatDate(maintenance.prochaineMaintenance)}
                        </span>
                        {daysUntil !== null && (
                          <span className={`text-xs font-medium ${
                            daysUntil < 0 
                              ? 'text-red-600' 
                              : daysUntil <= 3 
                              ? 'text-orange-600' 
                              : 'text-gray-500'
                          }`}>
                            {daysUntil < 0 
                              ? `(${Math.abs(daysUntil)}j de retard)`
                              : daysUntil <= 3
                              ? `(Dans ${daysUntil}j)`
                              : ''
                            }
                          </span>
                        )}
                      </div>
                      {maintenance.vehicle && maintenance.prochainKilometrage && (
                        <div className="text-xs text-gray-500 mt-1">
                          Km: {maintenance.vehicle.kilometrageTotal?.toLocaleString() || 0} / {maintenance.prochainKilometrage.toLocaleString()}
                          {maintenance.vehicle.kilometrageTotal >= maintenance.prochainKilometrage && (
                            <span className="text-red-600 font-semibold ml-1">(Dépassé)</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {maintenance.statut !== 'effectuee' && (
                          <button
                            onClick={() => handleMarkAsDone(maintenance._id)}
                            disabled={markingDone[maintenance._id]}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Marquer comme effectuée"
                          >
                            {markingDone[maintenance._id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(maintenance)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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

      {/* Composant de pagination */}
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

export default MaintenanceList;

