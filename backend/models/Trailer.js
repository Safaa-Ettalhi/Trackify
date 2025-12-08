const mongoose = require('mongoose');

const trailerSchema = new mongoose.Schema({
    numero:{
        type:Number ,
        required: [true, 'Le numéro est requis'],
        unique: true
    },
    type:{
        type:String,
        required: [true, 'Le type est requis']
    },
    capacite:{
        type:Number 
    },
    etat:{
        type:String,
        enum: ['disponible', 'utilisee', 'maintenance'],
        default:'disponible'
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Trailer',trailerSchema);