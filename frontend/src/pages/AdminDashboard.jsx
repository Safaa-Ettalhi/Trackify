import { useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import { Truck, Package, Route as RouteIcon, Wrench, FileText, LayoutDashboard, LogOut, Menu, X, Circle } from 'lucide-react';
import { AdminProvider } from '../context/AdminContext';
import Overview from './admin/Overview';
import Trucks from './admin/Trucks';
import Trailers from './admin/Trailers';
import Trips from './admin/Trips';
import Tires from './admin/Tires';
import Maintenance from './admin/Maintenance';
import ReportsPage from './admin/Reports';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [truckListRefreshKey, setTruckListRefreshKey] = useState(0);
  const [trailerListRefreshKey, setTrailerListRefreshKey] = useState(0);
  const [tripListRefreshKey, setTripListRefreshKey] = useState(0);
  const [maintenanceListRefreshKey, setMaintenanceListRefreshKey] = useState(0);
  const [tireListRefreshKey, setTireListRefreshKey] = useState(0);

  const loadDashboardData = async () => {
    
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTruckSuccess = () => {
    loadDashboardData();
    setTruckListRefreshKey(prev => prev + 1); 
  };

  const handleTrailerSuccess = () => {
    loadDashboardData();
    setTrailerListRefreshKey(prev => prev + 1);
  };

  const handleTripSuccess = () => {
    loadDashboardData();
    setTripListRefreshKey(prev => prev + 1);
  };

  const handleMaintenanceSuccess = () => {
    loadDashboardData();
    setMaintenanceListRefreshKey(prev => prev + 1);
  };

  const handleTireSuccess = () => {
    loadDashboardData();
    setTireListRefreshKey(prev => prev + 1);
  };

  const navigation = [
    { path: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { path: '/admin/trucks', label: 'Camions', icon: Truck },
    { path: '/admin/trailers', label: 'Remorques', icon: Package },
    { path: '/admin/trips', label: 'Trajets', icon: RouteIcon },
    { path: '/admin/tires', label: 'Pneus', icon: Circle },
    { path: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/admin/reports', label: 'Rapports', icon: FileText },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const adminContextValue = {
    handleCreateTruck: () => {},
    handleEditTruck: () => {},
    handleTruckSuccess,
    truckListRefreshKey,
    handleCreateTrailer: () => {},
    handleEditTrailer: () => {},
    handleTrailerSuccess,
    trailerListRefreshKey,
    handleCreateTrip: () => {},
    handleEditTrip: () => {},
    handleTripSuccess,
    tripListRefreshKey,
    handleCreateMaintenance: () => {},
    handleEditMaintenance: () => {},
    handleMaintenanceSuccess,
    maintenanceListRefreshKey,
    handleCreateTire: () => {},
    handleEditTire: () => {},
    handleTireSuccess,
    tireListRefreshKey,
  };

  return (
    <AdminProvider value={adminContextValue}>
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
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
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
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                      isActive(item.path)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
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
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 shadow-lg">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Nested Routes Content */}
          <Routes>
            <Route index element={<Overview />} />
            <Route path="trucks" element={<Trucks />} />
            <Route path="trailers" element={<Trailers />} />
            <Route path="trips" element={<Trips />} />
            <Route path="tires" element={<Tires />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="reports" element={<ReportsPage />} />
          </Routes>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminDashboard;