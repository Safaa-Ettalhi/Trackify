const PDFDocument = require('pdfkit');

const generateTripPDF = (trip) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).text('ORDRE DE MISSION', { align: 'center' }).moveDown();

      doc.fontSize(14)
         .text(`Numéro: ${trip.numero}`)
         .text(`Départ: ${trip.lieuDepart}`)
         .text(`Arrivée: ${trip.lieuArrivee}`)
         .text(`Date départ: ${new Date(trip.dateDepart).toLocaleDateString('fr-FR')}`)
         .text(`Date arrivée prévue: ${trip.dateArriveePrevue ? new Date(trip.dateArriveePrevue).toLocaleDateString('fr-FR') : '-'}`)
         .text(`Statut: ${trip.statut.toUpperCase()}`)
         .text(`Chauffeur: ${trip.chauffeur?.name || '-'}`)
         .text(`Camion: ${trip.camion?.immatriculation || '-'} - ${trip.camion?.modele || '-'}`)
         .text(`Remorque: ${trip.remorque?.numero || '-'} - ${trip.remorque?.type || '-'}`)
         .text(`Kilométrage départ: ${trip.kilometrageDepart || '-'} km`)
         .text(`Kilométrage arrivée: ${trip.kilometrageArrivee || '-'} km`)
         .text(`Volume gasoil: ${trip.volumeGasoil || '-'} litres`);

      if (trip.remarques) doc.moveDown().text(`Remarques: ${trip.remarques}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateTripPDF };
