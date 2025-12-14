const Maintenance = require('../models/Maintenance');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');

const getMaintenanceStatus = (maintenance, vehicle) => {
  if (maintenance.statut === 'effectuee') {
    return { status: 'ok', priority: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let status = 'ok';
  let priority = 0; 
  
  if (maintenance.prochaineMaintenance) {
    const nextDate = new Date(maintenance.prochaineMaintenance);
    nextDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      status = 'depassee';
      priority = 3;
    } else if (daysDiff <= 3) {
      status = 'urgente';
      priority = 2;
    } else if (daysDiff <= 7) {
      status = 'a_venir';
      priority = 1;
    }
  }
  
  if (maintenance.prochainKilometrage && vehicle) {
    const currentKm = vehicle.kilometrageTotal || 0;
    const kmDiff = maintenance.prochainKilometrage - currentKm;
    
    if (kmDiff <= 0) {
      if (priority < 3) {
        status = 'depassee';
        priority = 3;
      }
    } else if (kmDiff <= 500) {
      if (priority < 2) {
        status = 'urgente';
        priority = 2;
      }
    } else if (kmDiff <= 1000) {
      if (priority < 1) {
        status = 'a_venir';
        priority = 1;
      }
    }
  }
  
  return { status, priority };
};

exports.getMaintenances = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Maintenance.countDocuments();

    const maintenances = await Maintenance.find()
      .skip(skip)
      .limit(limit)
      .sort({ priority: -1, createdAt: -1 });
    
    const enrichedMaintenances = await Promise.all(
      maintenances.map(async (maintenance) => {
        let vehicle = null;
        try {
          if (maintenance.vehiculeType === 'camion') {
            vehicle = await Truck.findById(maintenance.vehiculeId);
          } else {
            vehicle = await Trailer.findById(maintenance.vehiculeId);
          }
        } catch (err) {
          console.error(`Véhicule introuvable pour maintenance ${maintenance._id}:`, err);
        }
        
        const { status, priority } = getMaintenanceStatus(maintenance, vehicle);
        
        return {
          ...maintenance.toObject(),
          vehicle: vehicle ? {
            id: vehicle._id,
            immatriculation: vehicle.immatriculation || vehicle.numero,
            kilometrageTotal: vehicle.kilometrageTotal || 0
          } : null,
          notificationStatus: status,
          priority
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: enrichedMaintenances.length,
      total: total,
      page: page,
      limit: limit,
      pages: Math.ceil(total / limit),
      data: enrichedMaintenances
    });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingMaintenances = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    
    const maintenances = await Maintenance.find({
      $or: [
        { 
          prochaineMaintenance: { 
            $lte: in7Days,
            $exists: true 
          } 
        },
        { 
          prochainKilometrage: { $exists: true } 
        }
      ]
    }).sort({ prochaineMaintenance: 1 });
    const enrichedMaintenances = await Promise.all(
      maintenances.map(async (maintenance) => {
        let vehicle = null;
        try {
          if (maintenance.vehiculeType === 'camion') {
            vehicle = await Truck.findById(maintenance.vehiculeId);
          } else {
            vehicle = await Trailer.findById(maintenance.vehiculeId);
          }
        } catch (err) {
          console.error(`Véhicule introuvable pour maintenance ${maintenance._id}:`, err);
        }
        
        const { status, priority } = getMaintenanceStatus(maintenance, vehicle);
        
        return {
          ...maintenance.toObject(),
          vehicle: vehicle ? {
            id: vehicle._id,
            immatriculation: vehicle.immatriculation || vehicle.numero,
            kilometrageTotal: vehicle.kilometrageTotal || 0
          } : null,
          notificationStatus: status,
          priority
        };
      })
    );
    
    enrichedMaintenances.sort((a, b) => b.priority - a.priority);
    
    res.status(200).json({
      success: true,
      count: enrichedMaintenances.length,
      data: enrichedMaintenances
    });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceNotifications = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    
    const maintenances = await Maintenance.find({
      $or: [
        { 
          prochaineMaintenance: { 
            $lte: in7Days,
            $exists: true 
          } 
        },
        { 
          prochainKilometrage: { $exists: true } 
        }
      ]
    });
    
    const notifications = [];
    
    for (const maintenance of maintenances) {
      let vehicle = null;
      try {
        if (maintenance.vehiculeType === 'camion') {
          vehicle = await Truck.findById(maintenance.vehiculeId);
        } else {
          vehicle = await Trailer.findById(maintenance.vehiculeId);
        }
      } catch (err) {
        console.error(`Véhicule introuvable pour maintenance ${maintenance._id}:`, err);
      }
      
      const { status, priority } = getMaintenanceStatus(maintenance, vehicle);

      if (priority >= 2 && maintenance.statut !== 'effectuee') {
        notifications.push({
          id: maintenance._id,
          type: maintenance.type,
          vehiculeType: maintenance.vehiculeType,
          vehiculeId: maintenance.vehiculeId,
          vehicle: vehicle ? {
            immatriculation: vehicle.immatriculation || vehicle.numero
          } : null,
          prochaineMaintenance: maintenance.prochaineMaintenance,
          prochainKilometrage: maintenance.prochainKilometrage,
          currentKilometrage: vehicle?.kilometrageTotal || 0,
          notificationStatus: status,
          priority,
          message: status === 'depassee' 
            ? 'Maintenance dépassée !' 
            : 'Maintenance urgente dans les 3 prochains jours'
        });
      }
    }
    
    notifications.sort((a, b) => b.priority - a.priority);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
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

exports.markAsDone = async (req, res, next) => {
  try {
    const { dateEffectuee, kilometrageEffectue } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance non trouvée'
      });
    }

    maintenance.statut = 'effectuee';
    maintenance.dateEffectuee = dateEffectuee ? new Date(dateEffectuee) : new Date();
    maintenance.derniereMaintenance = maintenance.dateEffectuee;
    
    if (kilometrageEffectue) {
      maintenance.kilometrageEffectue = kilometrageEffectue;
    }

    if (maintenance.periodiciteJours) {
      const nextDate = new Date(maintenance.dateEffectuee);
      nextDate.setDate(nextDate.getDate() + maintenance.periodiciteJours);
      maintenance.prochaineMaintenance = nextDate;
    }

    if (maintenance.periodiciteKm && maintenance.kilometrageEffectue) {
      maintenance.prochainKilometrage = maintenance.kilometrageEffectue + maintenance.periodiciteKm;
    }

    await maintenance.save();

    let vehicle = null;
    try {
      if (maintenance.vehiculeType === 'camion') {
        vehicle = await Truck.findById(maintenance.vehiculeId);
      } else {
        vehicle = await Trailer.findById(maintenance.vehiculeId);
      }
    } catch (err) {
      console.error(`Véhicule introuvable pour maintenance ${maintenance._id}:`, err);
    }

    const { status, priority } = getMaintenanceStatus(maintenance, vehicle);

    res.status(200).json({
      success: true,
      message: 'Maintenance marquée comme effectuée',
      data: {
        ...maintenance.toObject(),
        vehicle: vehicle ? {
          id: vehicle._id,
          immatriculation: vehicle.immatriculation || vehicle.numero,
          kilometrageTotal: vehicle.kilometrageTotal || 0
        } : null,
        notificationStatus: status,
        priority
      }
    });
  } catch (error) {
    next(error);
  }
};
