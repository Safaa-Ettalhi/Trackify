import { useState, useEffect } from 'react';
import { FileText, Fuel, Route, Wrench, TrendingUp, Download } from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('consumption');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [consumptionData, setConsumptionData] = useState([]);
  const [kilometrageData, setKilometrageData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'consumption') {
        const response = await api.get('/reports/consumption');
        setConsumptionData(response.data.data || []);
      } else if (activeTab === 'kilometrage') {
        const response = await api.get('/reports/kilometrage');
        setKilometrageData(response.data.data || []);
      } else if (activeTab === 'maintenance') {
        const response = await api.get('/reports/maintenance');
        setMaintenanceData(response.data.data || []);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des rapports';
      setError(errorMessage);
      console.error('Erreur détaillée:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'consumption', label: 'Consommation', icon: Fuel },
    { id: 'kilometrage', label: 'Kilométrage', icon: Route },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench }
  ];

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('fr-FR');
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const getVehiculeTypeLabel = (type) => {
    return type === 'camion' ? 'Camion' : 'Remorque';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rapports</h2>
        <p className="text-sm text-gray-500 mt-1">Analysez les performances de votre flotte</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-2 mb-6">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadReports}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des rapports...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Rapport de Consommation */}
          {activeTab === 'consumption' && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Rapport de Consommation</h3>
                      <p className="text-sm text-gray-500">Volume de gasoil consommé par camion</p>
                    </div>
                  </div>
                </div>
              </div>

              {consumptionData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Gasoil (L)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nombre de trajets</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Moyenne (L/trajet)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {consumptionData.map((item, index) => {
                        const moyenne = item.nombreTrajets > 0 
                          ? (item.totalGasoil / item.nombreTrajets).toFixed(2)
                          : '0';
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.camion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.modele}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.marque}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {formatNumber(item.totalGasoil)} L
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                              {item.nombreTrajets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                              {moyenne} L
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Fuel className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune donnée disponible</h3>
                  <p className="text-gray-500">Aucun trajet terminé avec consommation enregistrée</p>
                </div>
              )}
            </div>
          )}

          {/* Rapport de Kilométrage */}
          {activeTab === 'kilometrage' && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Route className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Rapport de Kilométrage</h3>
                      <p className="text-sm text-gray-500">Distance parcourue par camion</p>
                    </div>
                  </div>
                </div>
              </div>

              {kilometrageData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Kilomètres</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nombre de trajets</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Moyenne (km/trajet)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {kilometrageData.map((item, index) => {
                        const moyenne = item.nombreTrajets > 0 
                          ? (item.totalKilometres / item.nombreTrajets).toFixed(2)
                          : '0';
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.camion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.modele}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.marque}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {formatNumber(item.totalKilometres)} km
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                              {item.nombreTrajets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                              {moyenne} km
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Route className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune donnée disponible</h3>
                  <p className="text-gray-500">Aucun trajet terminé avec kilométrage enregistré</p>
                </div>
              )}
            </div>
          )}

          {/* Rapport de Maintenance */}
          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Rapport de Maintenance</h3>
                      <p className="text-sm text-gray-500">État des maintenances de la flotte</p>
                    </div>
                  </div>
                </div>
              </div>

              {maintenanceData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Périodicité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochain km</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {maintenanceData.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              {getTypeLabel(item.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {getVehiculeTypeLabel(item.vehiculeType)} #{item.vehiculeId?.slice(-6) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.periodiciteKm && `${formatNumber(item.periodiciteKm)} km`}
                            {item.periodiciteKm && item.periodiciteJours && ' / '}
                            {item.periodiciteJours && `${item.periodiciteJours} jours`}
                            {!item.periodiciteKm && !item.periodiciteJours && 'Non défini'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(item.derniereMaintenance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(item.prochaineMaintenance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.prochainKilometrage ? formatNumber(item.prochainKilometrage) + ' km' : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune maintenance enregistrée</h3>
                  <p className="text-gray-500">Aucune règle de maintenance n'a été configurée</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

