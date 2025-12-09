const Trip = require('../models/Trip');
const { generateTripPDF } = require('../services/pdfService');


exports.downloadTripPDF = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('chauffeur', 'name email')
      .populate('camion', 'immatriculation modele marque')
      .populate('remorque', 'numero type');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trajet non trouvé'
      });
    }

    if (req.user.role === 'chauffeur' && trip.chauffeur._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const pdfBuffer = await generateTripPDF(trip);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=trajet-${trip.numero}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};