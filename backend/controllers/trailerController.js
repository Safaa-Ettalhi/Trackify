const Trailer = require('../models/Trailer');  

exports.getTrailers = async (req, res, next) => {
    try {
        const trailers = await Trailer.find();
        res.status(200).json({
            success: true,
            count: trailers.length,
            data: trailers
        });
    } catch (error) {
        next(error);
    }
};

exports.getTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.id);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        next(error);
    }
};

exports.createTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.create(req.body);

        res.status(201).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!trailer) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndDelete(req.params.id);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Remorque supprimée avec succès'
        });
    } catch (error) {
        next(error);
    }
};
