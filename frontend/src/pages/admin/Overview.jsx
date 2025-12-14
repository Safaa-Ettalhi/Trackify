import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Route, Wrench, FileText, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const Overview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    trucks: 0,
    activeTrips: 0,
    upcomingMaintenance: 0,
    urgentMaintenance: 0,
    overdueMaintenance: 0,
    trailers: 0
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [trucksRes, tripsRes, maintenanceRes, notificationsRes, trailersRes] = await Promise.all([
        api.get('/trucks'),
        api.get('/trips'),
        api.get('/maintenance/upcoming'),
        api.get('/maintenance/notifications').catch(() => ({ data: { data: [] } })),
        api.get('/trailers')
      ]);

      const trucks = trucksRes.data.data || [];
      const trips = tripsRes.data.data || [];
      const maintenances = maintenanceRes.data.data || [];
      const notifications = notificationsRes.data.data || [];
      const trailers = trailersRes.data.data || [];

      const activeTrips = trips.filter(trip => trip.statut === 'en_cours').length;
      const urgentMaintenance = notifications.filter(n => n.notificationStatus === 'urgente').length;
      const overdueMaintenance = notifications.filter(n => n.notificationStatus === 'depassee').length;
      
      setStats({
        trucks: trucks.length,
        activeTrips: activeTrips,
        upcomingMaintenance: maintenances.length,
        urgentMaintenance,
        overdueMaintenance,
        trailers: trailers.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const statsData = [
    { 
      label: 'Camions actifs', 
      value: stats.trucks.toString(), 
      change: '+0%', 
      trend: 'neutral', 
      subtitle: 'Total enregistrés', 
      icon: Truck, 
      color: 'blue' 
    },
    { 
      label: 'Trajets en cours', 
      value: stats.activeTrips.toString(), 
      change: '+0%', 
      trend: stats.activeTrips > 0 ? 'up' : 'neutral', 
      subtitle: `${stats.activeTrips} actif${stats.activeTrips > 1 ? 's' : ''}`, 
      icon: Route, 
      color: 'green' 
    },
    { 
      label: 'Maintenances', 
      value: stats.upcomingMaintenance.toString(), 
      change: '-0%', 
      trend: stats.upcomingMaintenance > 0 ? 'down' : 'neutral', 
      subtitle: stats.overdueMaintenance > 0 
        ? `${stats.overdueMaintenance} dépassée${stats.overdueMaintenance > 1 ? 's' : ''}, ${stats.urgentMaintenance} urgente${stats.urgentMaintenance > 1 ? 's' : ''}`
        : stats.urgentMaintenance > 0
        ? `${stats.urgentMaintenance} urgente${stats.urgentMaintenance > 1 ? 's' : ''}, ${stats.upcomingMaintenance} à venir`
        : `${stats.upcomingMaintenance} à venir`, 
      icon: Wrench, 
      color: stats.overdueMaintenance > 0 ? 'red' : stats.urgentMaintenance > 0 ? 'orange' : 'orange'
    },
    { 
      label: 'Remorques', 
      value: stats.trailers.toString(), 
      change: '0%', 
      trend: 'neutral', 
      subtitle: 'Total enregistrées', 
      icon: Package, 
      color: 'purple' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alertes de maintenance urgente */}
      {(stats.urgentMaintenance > 0 || stats.overdueMaintenance > 0) && (
        <div className={`rounded-2xl p-6 border-2 ${
          stats.overdueMaintenance > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.overdueMaintenance > 0 
                ? 'bg-red-100' 
                : 'bg-orange-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                stats.overdueMaintenance > 0 
                  ? 'text-red-600' 
                  : 'text-orange-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${
                stats.overdueMaintenance > 0 
                  ? 'text-red-900' 
                  : 'text-orange-900'
              }`}>
                {stats.overdueMaintenance > 0 
                  ? `⚠️ ${stats.overdueMaintenance} maintenance${stats.overdueMaintenance > 1 ? 's' : ''} dépassée${stats.overdueMaintenance > 1 ? 's' : ''} !`
                  : `⚠️ ${stats.urgentMaintenance} maintenance${stats.urgentMaintenance > 1 ? 's' : ''} urgente${stats.urgentMaintenance > 1 ? 's' : ''} à planifier`
                }
              </h3>
              <p className={`text-sm mb-4 ${
                stats.overdueMaintenance > 0 
                  ? 'text-red-700' 
                  : 'text-orange-700'
              }`}>
                {stats.overdueMaintenance > 0 
                  ? 'Des maintenances sont en retard. Veuillez les planifier immédiatement.'
                  : 'Des maintenances doivent être effectuées dans les 3 prochains jours.'
                }
              </p>
              <button
                onClick={() => navigate('/admin/maintenance')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  stats.overdueMaintenance > 0
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                Voir les maintenances →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            orange: 'from-orange-500 to-orange-600',
            purple: 'from-purple-500 to-purple-600',
            red: 'from-red-500 to-red-600'
          };
          return (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/trucks')}
            className="flex flex-col items-center justify-center space-y-3 p-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-semibold">Nouveau camion</span>
          </button>
          <button 
            onClick={() => navigate('/admin/trips')}
            className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Route className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold">Créer trajet</span>
          </button>
          <button 
            onClick={() => navigate('/admin/maintenance')}
            className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-semibold">Planifier maintenance</span>
          </button>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-semibold">Générer rapport</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;

