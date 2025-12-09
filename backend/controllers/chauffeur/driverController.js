const Trip = require('../../models/Trip');

exports.getMyTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ chauffeur: req.user._id })
      .populate('camion', 'immatriculation modele marque')
      .populate('remorque', 'numero type')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};


exports.updateTripStatus = async (req, res, next) => {
  try {
    const { statut } = req.body;
    
    const statutsValides = ['a_faire', 'en_cours', 'termine', 'annule'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trajet non trouvé'
      });
    }

    if (trip.chauffeur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce trajet'
      });
    }

    trip.statut = statut;
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('camion', 'immatriculation modele marque')
      .populate('remorque', 'numero type')
      .populate('chauffeur', 'name email');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTripData = async (req, res, next) => {
  try {
    const { kilometrageDepart, kilometrageArrivee, volumeGasoil, remarques } = req.body;
    
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trajet non trouvé'
      });
    }

    if (trip.chauffeur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce trajet'
      });
    }

    if (kilometrageDepart !== undefined) trip.kilometrageDepart = kilometrageDepart;
    if (kilometrageArrivee !== undefined) trip.kilometrageArrivee = kilometrageArrivee;
    if (volumeGasoil !== undefined) trip.volumeGasoil = volumeGasoil;
    if (remarques !== undefined) trip.remarques = remarques;

    await trip.save();
    const updatedTrip = await Trip.findById(trip._id)
      .populate('camion', 'immatriculation modele marque')
      .populate('remorque', 'numero type')
      .populate('chauffeur', 'name email');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    next(error);
  }
};