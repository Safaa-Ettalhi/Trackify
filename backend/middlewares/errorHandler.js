//gestion des erreurs
const errorHandler = (err, req, res, next) => {

   // valeurs par defaut
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Erreur serveur';
  
    // si ObjectId invalide 
    if (err.name === 'CastError') {
      statusCode = 404;
      message = 'Ressource introuvable';
    }
  
    // cas de duplication
    if (err.code === 11000) {
      statusCode = 400;
      message = 'Cette donnée existe déjà';
    }
  
    // cas derr de validation 
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(e => e.message).join(', ');
    }
  
    res.status(statusCode).json({
      success: false,
      message
    });
  };
  
  module.exports = errorHandler;
  