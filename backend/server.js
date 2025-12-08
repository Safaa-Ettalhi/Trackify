const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.json({message:"L'API Trackify est en cours d'exécution."});
})

app.use('/api/auth',authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Serveur exécuté sur le port ${PORT}`);
})


