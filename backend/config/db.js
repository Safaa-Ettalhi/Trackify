const mongoose = require('mongoose');
const connectDB = async()=>{
    try{
        const conn =await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected avec succes `);
    }catch(error){
        console.error(`erreur de connexion à MongoDB: ${error.message}`);
        process.exit(1);
    }
}
module.exports = connectDB;
