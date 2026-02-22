import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    contact: { 
        type: String, 
        required: true 
    },
    // This should store the Clerk User ID (e.g., 'user_2p...') 
    owner: { 
        type: String, 
        required: true, 
        ref: "User" 
    },
    city: { 
        type: String, 
        required: true 
    },
    // Optional: Usually hotels have a description or an image
    // description: { type: String },
    // image: { type: String }
}, { timestamps: true });

// Check if model exists before creating a new one (prevents errors on server restart)
const Hotel = mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);

export default Hotel;