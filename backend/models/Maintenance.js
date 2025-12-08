const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:['vidange', 'revision', 'pneus', 'autre'],
        required: [true, 'Le type de maintenance est requis']
    },
    vehiculeType:{
        type:String,
        enum:['camion', 'remorque'],
        required: [true, 'Le type de véhicule est requis']
    },
    vehiculeId:{
        type:mongoose.Schema.Types.ObjectId ,
        required: [true, 'L\'ID du véhicule est requis']
    },
    periodiciteKm:{
        type:Number
    },
    periodiciteJours:{
        type:Number
    },
    derniereMaintenance: {
        type: Date
    },
    prochaineMaintenance: {
        type: Date
    },
    prochainKilometrage: {
        type: Number
    }

},{
 timestamps:true    
})

module.exports = mongoose.model('Maintenance',maintenanceSchema);