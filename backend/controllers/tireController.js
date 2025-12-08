const Tire = require('../models/Tire');

exports.getTires = async (req, res, next) => {
  try {
    const tires = await Tire.find();
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    next(error);
  }
};
exports.getTire = async (req, res, next) => {
  try {
    const tire = await Tire.findById(req.params.id);
    
    if (!tire) {
      return res.status(404).json({
        success: false,
        message: 'Pneu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tire
    });
  } catch (error) {
    next(error);
  }
};
exports.createTire = async (req, res, next) => {
  try {
    const tire = await Tire.create(req.body);
    res.status(201).json({
      success: true,
      data: tire
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTire = async (req, res, next) => {
  try {
    const tire = await Tire.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!tire) {
      return res.status(404).json({
        success: false,
        message: 'Pneu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tire
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteTire = async (req, res, next) => {
  try {
    const tire = await Tire.findByIdAndDelete(req.params.id);
    
    if (!tire) {
      return res.status(404).json({
        success: false,
        message: 'Pneu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Pneu supprimé'
    });
  } catch (error) {
    next(error);
  }
};

