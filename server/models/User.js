import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // This is where the Clerk ID goes
  username: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
  recentSearchedCities: { type: [String], default: [] } // Added this so your other functions work
}, { 
  timestamps: true, 
  _id: false // Tells Mongoose to use the String _id we provide
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;