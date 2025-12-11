import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Route, Wrench, FileText, LayoutDashboard, LogOut, Menu, X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import api from '../services/api';
import TruckList from '../components/TruckList';
import TruckForm from '../components/TruckForm';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [stats, setStats] = useState({
    trucks: 0,
    activeTrips: 0,
    upcomingMaintenance: 0,
    trailers: 0
  });
 
  useEffect(() => {
    loadDashboardData();
  }, []);


  const loadDashboardData = async () => {
    try {
      
      const [trucksRes, tripsRes, maintenanceRes, trailersRes] = await Promise.all([
        api.get('/trucks'),
        api.get('/trips'),
        api.get('/maintenance/upcoming'),
        api.get('/trailers')
      ]);

      const trucks = trucksRes.data.data || [];
      const trips = tripsRes.data.data || [];
      const maintenances = maintenanceRes.data.data || [];
      const trailers = trailersRes.data.data || [];

      const activeTrips = trips.filter(trip => trip.statut === 'en_cours').length;
      
      setStats({
        trucks: trucks.length,
        activeTrips: activeTrips,
        upcomingMaintenance: maintenances.length,
        trailers: trailers.length
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } 
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleCreateTruck = () => {
    setSelectedTruck(null);
    setShowTruckForm(true);
  };

  const handleEditTruck = (truck) => {
    setSelectedTruck(truck);
    setShowTruckForm(true);
  };

  const handleTruckSuccess = () => {
    loadDashboardData(); 
  };
  const navigation = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'trucks', label: 'Camions', icon: Truck },
    { id: 'trailers', label: 'Remorques', icon: Package },
    { id: 'trips', label: 'Trajets', icon: Route },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'reports', label: 'Rapports', icon: FileText },
  ];

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
      subtitle: `${stats.upcomingMaintenance} à venir`, 
      icon: Wrench, 
      color: 'orange' 
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trackify</span>
                <p className="text-xs text-gray-500">Fleet Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-gray-200">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl "
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*  Desktop */}
        <nav className="hidden sm:flex space-x-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 shadow-lg">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  green: 'from-green-500 to-green-600',
                  orange: 'from-orange-500 to-orange-600',
                  purple: 'from-purple-500 to-purple-600'
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


            {/* Actions */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center space-y-3 p-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">Nouveau camion</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Route className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold">Créer trajet</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="font-semibold">Planifier maintenance</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold">Générer rapport</span>
                </button>
              </div>
            </div>
          </div>
        )}

         {/* Section Camions */}
              {activeSection === 'trucks' && (
          <TruckList 
          onEdit={handleEditTruck}
          onCreate={handleCreateTruck} 
          />
        )}

        {activeSection !== 'overview' && activeSection !== 'trucks' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center">
            <div className="max-w-md mx-auto">
              {navigation.find(n => n.id === activeSection) && (
                <>
                  {(() => {
                    const Icon = navigation.find(n => n.id === activeSection).icon;
                    return (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Icon className="w-10 h-10 text-gray-400" />
                      </div>
                    );
                  })()}
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {navigation.find(n => n.id === activeSection).label}
                  </h2>
                </>
              )}
              <p className="text-gray-500 text-lg">Cette fonctionnalité est en cours de développement</p>
              <div className="mt-8 inline-flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Disponible prochainement</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {showTruckForm && (
        <TruckForm
          truck={selectedTruck}
          onClose={() => {
            setShowTruckForm(false);
            setSelectedTruck(null);
          }}
          onSuccess={handleTruckSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;