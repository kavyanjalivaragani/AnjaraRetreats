import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  // Link to the Hotel (This is the only one that needs 'ref')
  hotel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Hotel", 
    required: true 
  },
  
  // Room details
  roomType: { 
    type: String, 
    required: true 
  },
  
  // Changed to Number for revenue calculations
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  
  // FIXED: Changed to Array [String] to accept multiple values
  amenities: { 
    type: [String], 
    required: true 
  },
  
  // FIXED: Changed to Array [String] for multiple image URLs
  images: { 
    type: [String], 
    required: true 
  },
  
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true }); // Note: 'timestamps' is usually all lowercase

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;