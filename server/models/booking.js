import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, ref: "User", required: true }, // Clerk ID
  clerkId: { type: String, required: true },

  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },

  checkInDate: Date,
  checkOutDate: Date,
  totalPrice: Number,
  guests: Number,

  status: {
    type: String,
    enum: ["pending", "confirmed", "booked", "cancelled"],
    default: "pending",
  },

  paymentMethod: { type: String, default: "Pay At Hotel" },
  isPaid: { type: Boolean, default: false },

}, { timestamps: true });




const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
