const Maintenance = require('../models/Maintenance');

exports.getMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.find();
    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingMaintenances = async (req, res, next) => {
  try {
    const today = new Date();
    const maintenances = await Maintenance.find({
      $or: [
        { prochaineMaintenance: { $lte: today } },
        { prochainKilometrage: { $exists: true } }
      ]
    }).sort({ prochaineMaintenance: 1 });
    
    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances
    });
  } catch (error) {
    next(error);
  }
};

exports.createMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Règle de maintenance non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};