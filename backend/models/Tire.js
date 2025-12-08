const mongoose = require('mongoose');

const tireSchema = new mongoose.Schema({
    reference:{
        type:String,
        required: [true, 'La référence est requise']
    },
    etat:{
        type:String,
        enum:['neuf', 'bon', 'usure', 'a_remplacer'],
        default:'neuf'
    },
    kilometrage: {
        type: Number,
        default: 0
    },
    vehiculeType:{
        type:String,
        enum: ['camion', 'remorque'],
        required: [true, 'Le type de véhicule est requis']
    },
    vehiculeId:{
        type:mongoose.Schema.Types.ObjectId,
        required: [true, 'L\'ID du véhicule est requis']
    },
    dateInstallation:{
        type:Date,
        default: Date.now
    }


},{
    timestamps:true
})

module.exports= mongoose.model('Tire', tireSchema)