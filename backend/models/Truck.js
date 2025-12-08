const mongoose = require('mongoose');
const truckSchema = new mongoose.Schema({
    immatriculation:{
        type:String,
        required: [true, 'L\'immatriculation est requise'],
        unique:true
    },
    modele:{
        type:String,
        required: [true, 'Le modèle est requis']
    },
    marque:{
        type:String,
        required:[true,'La marque est requise']
    },
    kilometrageTotal:{
        type:Number,
        default:0
        
    },
    etat:{
        type:String,
        enum:['disponible', 'en_route', 'maintenance'],
        default:'disponible'
    }
},{
    timestamps:true
});

module.exports =mongoose.model('Truck', truckSchema)