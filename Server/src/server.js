import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();
const app = express();

// middleware configuration 

app.use(cors());
app.use(express.json());

// converting raw data into javascript object
app.use(express.urlencoded({ extended: true }));

// Routes

// connecting mongodb
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(() => {
    console.log('connected to mongodb');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`server is connected on port ${PORT}`);        
    });
}).catch((error) => {
    console.error('Error connecting tomongodb', error.message);
});