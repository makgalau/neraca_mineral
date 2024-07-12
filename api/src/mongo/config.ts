import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://admin:adminpassword@localhost:27017/nsdm?authSource=admin'; 

// Konfigurasi MongoDB
const connectToDatabase = async() => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export default connectToDatabase;