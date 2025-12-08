const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: [true, 'Le numéro de trajet est requis'],
        unique: true
    },
    lieuDepart:{
        type:String,
        required: [true, 'Le lieu de départ est requis']
    },
    lieuArrivee: {
        type: String,
        required: [true, 'Le lieu d\'arrivée est requis']
    },
    dateDepart:{
        type:Date, required: [true, 'La date de départ est requise']
    },
    dateArriveePrevue: {
        type: Date
    },
    chauffeur:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: [true, 'Le chauffeur est requis']
    },
    camion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
        required: [true, 'Le camion est requis']
    },
    remorque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trailer'
    },
    statut:{
        type:String,
        enum:['a_faire', 'en_cours', 'termine', 'annule'],
        default: 'a_faire'
    },
    kilometrageDepart: {
        type: Number
    },
    kilometrageArrivee: {
        type: Number
    },
    volumeGasoil: {
        type: Number
    },
    remarques: {
        type: String
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip',tripSchema);
