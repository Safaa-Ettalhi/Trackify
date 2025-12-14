import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Route, LogOut, Menu, X } from 'lucide-react';
import api from '../services/api';
import TripCard from '../components/TripCard';
import TripUpdateForm from '../components/TripUpdateForm';
import Pagination from '../components/Pagination';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const [filters, setFilters] = useState({
    statut: '',      
    search: ''      
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadMyTrips();
  }, [pagination.page]);

  const loadMyTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/driver/trips', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setTrips(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 0
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      await api.put(`/driver/trips/${tripId}/status`, { statut: newStatus });
      loadMyTrips();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(error);
    }
  };

  const handleDownloadPDF = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trajet-${tripId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleEdit = (trip) => {
    setSelectedTrip(trip);
    setShowUpdateForm(true);
  };

  const filteredTrips = trips.filter(trip => {
    if (filters.statut && trip.statut !== filters.statut) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        trip.numero?.toLowerCase().includes(searchLower) ||
        trip.lieuDepart?.toLowerCase().includes(searchLower) ||
        trip.lieuArrivee?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos trajets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <Route className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trackify</span>
                <p className="text-xs text-gray-500">Tableau de bord chauffeur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Chauffeur</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-gray-200">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
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
          <div className="px-4 py-2">
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes Trajets</h2>
              <p className="text-sm text-gray-500 mt-1">Gérez vos trajets assignés</p>
            </div>
            <button
              onClick={loadMyTrips}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Actualiser
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  placeholder="Numéro, lieu départ, lieu arrivée..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Filtrer par statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} trouvé{filteredTrips.length > 1 ? 's' : ''}
              </p>
              {(filters.statut || filters.search) && (
                <button
                  onClick={() => setFilters({ statut: '', search: '' })}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        </div>

        {trips.length > 0 ? (
          filteredTrips.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onUpdateStatus={handleUpdateStatus}
                    onDownloadPDF={handleDownloadPDF}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
              
              {/* Pagination  */}
              {!filters.statut && !filters.search && pagination.pages > 1 && (
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Route className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun trajet trouvé</h3>
              <p className="text-gray-500 mb-4">Aucun trajet ne correspond à vos critères de recherche</p>
              <button
                onClick={() => setFilters({ statut: '', search: '' })}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Route className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun trajet assigné</h3>
            <p className="text-gray-500">Vous serez notifié lorsqu'un trajet vous sera assigné</p>
          </div>
        )}
      </div>
      
      {showUpdateForm && selectedTrip && (
        <TripUpdateForm
          trip={selectedTrip}
          onClose={() => {
            setShowUpdateForm(false);
            setSelectedTrip(null);
          }}
          onSuccess={() => {
            loadMyTrips();
            setShowUpdateForm(false);
            setSelectedTrip(null);
          }}
        />
      )}
    </div>
  );
};

export default DriverDashboard;