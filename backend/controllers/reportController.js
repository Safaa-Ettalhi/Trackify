const Trip = require('../models/Trip');
const Truck = require('../models/Truck');
const Maintenance = require('../models/Maintenance');

exports.getConsumptionReport = async (req, res, next) => {
  try {
    const trips = await Trip.find({ 
      statut: 'termine',
      volumeGasoil: { $exists: true, $ne: null }
    }).populate('camion', 'immatriculation modele marque');

    const consumptionByTruck = {};
    trips.forEach(trip => {
      // Vérifier que le camion existe
      if (!trip.camion || !trip.camion._id) {
        return; // Ignorer les trajets sans camion
      }
      
      const truckId = trip.camion._id.toString();
      if (!consumptionByTruck[truckId]) {
        consumptionByTruck[truckId] = {
          camion: trip.camion.immatriculation || 'N/A',
          modele: trip.camion.modele || 'N/A',
          marque: trip.camion.marque || 'N/A',
          totalGasoil: 0,
          nombreTrajets: 0
        };
      }
      consumptionByTruck[truckId].totalGasoil += trip.volumeGasoil || 0;
      consumptionByTruck[truckId].nombreTrajets += 1;
    });

    res.status(200).json({
      success: true,
      data: Object.values(consumptionByTruck)
    });
  } catch (error) {
    next(error);
  }
};


exports.getKilometrageReport = async (req, res, next) => {
  try {
    const trips = await Trip.find({ 
      statut: 'termine',
      kilometrageDepart: { $exists: true },
      kilometrageArrivee: { $exists: true }
    }).populate('camion', 'immatriculation modele marque');

    const kilometrageByTruck = {};
    trips.forEach(trip => {
      if (!trip.camion || !trip.camion._id) {
        return; 
      }
      
      const truckId = trip.camion._id.toString();
      const distance = (trip.kilometrageArrivee || 0) - (trip.kilometrageDepart || 0);
      
      if (distance <= 0) {
        return; 
      }
      
      if (!kilometrageByTruck[truckId]) {
        kilometrageByTruck[truckId] = {
          camion: trip.camion.immatriculation || 'N/A',
          modele: trip.camion.modele || 'N/A',
          marque: trip.camion.marque || 'N/A',
          totalKilometres: 0,
          nombreTrajets: 0
        };
      }
      kilometrageByTruck[truckId].totalKilometres += distance;
      kilometrageByTruck[truckId].nombreTrajets += 1;
    });

    res.status(200).json({
      success: true,
      data: Object.values(kilometrageByTruck)
    });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceReport = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.find()
      .sort({ prochaineMaintenance: 1 });

    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances
    });
  } catch (error) {
    next(error);
  }
};