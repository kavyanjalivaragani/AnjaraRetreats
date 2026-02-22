import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);

    mongoose.connection.on('connected', () => {
      console.log("✅ MongoDB Connected Successfully");
    });

    mongoose.connection.on('error', err => {
      console.error('❌ Mongoose runtime error:', err);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'AnjaraRetreats',
      serverSelectionTimeoutMS: 5000, 
    });

  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log("\n--------------------------------------------------");
      console.log("🛠️  TROUBLESHOOTING TIP:");
      console.log("Your network/DNS is blocking MongoDB (Port 27017).");
      console.log("1. Switch to a MOBILE HOTSPOT.");
      console.log("2. Use Google DNS (8.8.8.8) in Windows settings.");
      console.log("--------------------------------------------------\n");
    }
    
    // IMPORTANT: Re-throw the error so server.js catches it 
    // and doesn't try to start the API with a broken DB.
    throw error; 
  }
};

export default connectDB;