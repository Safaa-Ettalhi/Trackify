import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Route, LogOut, Menu, X, MapPin, Calendar, Download} from 'lucide-react';
import api from '../services/api';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('trips');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    loadMyTrips();
  }, []);

  const loadMyTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/driver/trips');
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'termine': return 'bg-green-100 text-green-700';
      case 'a_faire': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'a_faire': return 'À faire';
      default: return status;
    }
  };

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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-semibold shadow-lg ">
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
            <button
              onClick={() => {
                setActiveSection('trips');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                activeSection === 'trips'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Route className="w-5 h-5" />
              <span className="font-medium">Mes Trajets</span>
            </button>
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
        
        <nav className="hidden sm:flex space-x-2 mb-8 bg-white/80  rounded-2xl p-2 border border-gray-200/50 shadow-md">
          <button
            onClick={() => setActiveSection('trips')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm ${
              activeSection === 'trips'
                ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Mes Trajets</span>
          </button>
        </nav>

        {/* Content */}
        {activeSection === 'trips' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mes Trajets</h2>
              <button
                onClick={loadMyTrips}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 "
              >
                Actualiser
              </button>
            </div>

            {trips.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {trips.map((trip) => (
                  <div key={trip._id} className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl ">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Trajet #{trip.numero}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.statut)}`}>
                            {getStatusLabel(trip.statut)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.lieuDepart} → {trip.lieuArrivee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadPDF(trip._id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date de départ</p>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">{formatDate(trip.dateDepart)}</p>
                        </div>
                      </div>
                      {trip.dateArriveePrevue && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Date d'arrivée prévue</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">{formatDate(trip.dateArriveePrevue)}</p>
                          </div>
                        </div>
                      )}
                      {trip.camion && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Camion</p>
                          <p className="text-sm font-medium text-gray-900">{trip.camion.immatriculation}</p>
                        </div>
                      )}
                      {trip.remorque && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Remorque</p>
                          <p className="text-sm font-medium text-gray-900">#{trip.remorque.numero}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;