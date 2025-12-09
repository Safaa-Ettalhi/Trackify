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
      const truckId = trip.camion._id.toString();
      if (!consumptionByTruck[truckId]) {
        consumptionByTruck[truckId] = {
          camion: trip.camion.immatriculation,
          modele: trip.camion.modele,
          marque: trip.camion.marque,
          totalGasoil: 0,
          nombreTrajets: 0
        };
      }
      consumptionByTruck[truckId].totalGasoil += trip.volumeGasoil;
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
      const truckId = trip.camion._id.toString();
      const distance = trip.kilometrageArrivee - trip.kilometrageDepart;
      
      if (!kilometrageByTruck[truckId]) {
        kilometrageByTruck[truckId] = {
          camion: trip.camion.immatriculation,
          modele: trip.camion.modele,
          marque: trip.camion.marque,
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