const Truck = require('../models/Truck');

exports.getTrucks = async (req, res, next) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Truck.countDocuments();

        const trucks = await Truck.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: trucks.length,
            total: total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
            data: trucks
        })
    }catch(error){
        next(error);
    }
}
exports.getTruck = async(req,res,next)=>{
    try {
        const truck = await Truck.findById(req.params.id)
        if(!truck){
            res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            })
        }
        res.status(200).json({
            success: true,
            data: truck
        });
        
    } catch (error) {
        next(error)
    }
}

exports.createTruck= async(req,res,next)=>{
    try {
        const truck = await Truck.create(req.body);
        res.status(201).json({
            success: true,
            data: truck
        });
    } catch (error) {
        next(error)
    }
}

exports.updateTruck = async(req,res,next)=>{
    try {
        const truck = await Truck.findByIdAndUpdate(req.params.id,req.body,{
        new: true,        
        runValidators: true 
      })
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Camion non trouvé'
      });
    }
    res.status(200).json({
        success:true,
        data:truck
    })
      
    } catch (error) {
        next(error)
    }
}

exports.deleteTruck = async (req, res, next)=>{
    try {
        const truck = await Truck.findByIdAndDelete(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }
         res.status(200).json({
            success: true,
            message: 'Camion supprimé'
         });
    } catch (error) {
        next(error)
    }
}
