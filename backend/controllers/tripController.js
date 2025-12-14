const Trip = require('../models/Trip');

exports.getTrips = async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let queryFilter = {};
        if (req.user.role === 'chauffeur') {
            queryFilter = { chauffeur: req.user._id };
        }

        const total = await Trip.countDocuments(queryFilter);

        const trips = await Trip.find(queryFilter)
                      .skip(skip)
                      .limit(limit)
                      .populate('chauffeur','name email')
                      .populate('camion' , 'immatriculation modele marque')
                      .populate('remorque','numero type')
                      .sort({ createdAt: -1 }); 
        
        res.status(200).json({
            success: true ,
            count : trips.length ,
            total: total,
            page: page,
            limit: limit,
            pages: Math.ceil(total / limit),
            data : trips
        });

    } catch (error) {
        next(error) ;
    }
}
exports.getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
                           .populate('chauffeur' , 'name email ') 
                           .populate('camion' , 'immatriculation modele marque')
                           .populate('remorque','numero type' );
        if(!trip){
           return res.status(404).json({
                success:false,
                message:'Trajet non trouvé'
            });
        }
        if(req.user.role ==='chauffeur'&& trip.chauffeur._id.toString() !== req.user._id.toString()){

            return res.status(403).json({
                success:false ,
                message: 'Accés non autorisé '
            })
        }

        res.status(200).json({
            success:true ,
            data :trip
        });

    } catch (error) {
        next(error);
    }
}

exports.createTrip = async (req, res, next) => {
    try {
        const trip =await  Trip.create(req.body) ;

        const populatedTrip = await Trip.findById(trip._id)
                              .populate('chauffeur', 'name email')
                              .populate('camion', 'immatriculation modele marque')
                              .populate('remorque', 'numero type');

        res.status(201).json({
            success: true ,
            data :populatedTrip
        });
    } catch (error) {
        next(error);
    }
}

exports.updateTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id,req.body,{
            new:true ,
            runValidators :true
        })
        .populate('chauffeur', 'name email')
        .populate('camion', 'immatriculation modele marque')
        .populate('remorque', 'numero type');

        if(!trip){
            return res.status(404).json({
                success: false ,
                message: 'Trajet non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: trip
        });
    } catch (error) {
        next(error) ;
    }
}
exports.deleteTrip = async (req, res, next) =>{
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if(!trip){
            return res.status(404).json({
                success:false,
                message:'Trajet non trouvé'
            })
        }

        res.status(200).json({
            success:true,
            message:"Trajet supprimer "
        })

    } catch (error) {
        next(error)
    }
}