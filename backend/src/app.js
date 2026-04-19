import express from 'express';
import {createServer} from 'node:http';

import {Server} from 'socket.io';
import cors from 'cors';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {connectToSocket} from './controllers/socketManager.js';
import userRoutes from './routes/usersroutes.js';




dotenv.config(); 


const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000)
app.use(cors());
app.use(express.json({limit: '50kb'}));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

//
/*app.get('/home', (req, res) => {
    return res.json('Hello World!');
});*/

app.use('/api/v1/users', userRoutes);


// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Start server
const start = async () => {
  await connectDB();

   
   server.listen(process.env.PORT || 8000, () => {
    console.log(`Server listening on port ${process.env.PORT || 8000}`);
  });
};

start();