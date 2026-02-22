import Booking from "../models/booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import transporter  from "../config/nodemailer.js";
import User from "../models/User.js"
import { getClerkId } from "../middleware/authMiddleware.js";
import Stripe from "stripe"
// function to check availability of room
const checkAvailability = async (checkInDate, checkOutDate, room) => {
  try {
    const bookings = await Booking.find({
      room,
      // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
      checkInDate: { $lt: new Date(checkOutDate) }, 
      checkOutDate: { $gt: new Date(checkInDate) },
    });
  
    return bookings.length === 0;
  } catch (error) {
    console.error("Availability Check Error:", error.message);
    return false;
  }
};

// API to check availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability(checkInDate, checkOutDate, room);
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// CREATE BOOKING API
// controllers/bookingController.js




export const createBooking = async (req, res) => {
  try {
    const clerkId = getClerkId(req);
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const roomData = await Room.findById(room).populate("hotel");

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    const booking = await Booking.create({
      user: clerkId,
      clerkId,
      room,
      hotel: roomData.hotel._id,
      guests,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: "pending", // 👈 Change from "booked" to "pending"
      isPaid: false,      // 👈 Explicitly set to false
      paymentMethod: "Pay At Hotel" // Default starting value
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};






// API to get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    // Determine Clerk ID for current user
    const clerkId = getClerkId(req);
    const bookings = await Booking.find({ user: clerkId })
      .populate({
        path: 'room',
        populate: { path: 'hotel' } // Deep populate to get hotel details inside room
      })
      .populate("hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// API to get hotel bookings (Owner dashboard)
export const getHotelBookings = async (req, res) => {
  try {
    // Ensure Clerk ID is retrieved consistently
    const clerkId = getClerkId(req);

    const hotel = await Hotel.findOne({ owner: clerkId });
    if (!hotel) {
      return res.json({ success: false, message: "No hotel found for this owner" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room")
      .populate('user')
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// controllers/stripePayment.js



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const room = await Room.findById(booking.room).populate("hotel");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: room.hotel.name,
              description: `Room: ${room.roomType}` 
            },
            unit_amount: booking.totalPrice * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/My-bookings?success=true`,
      cancel_url: `${req.headers.origin}/My-bookings?canceled=true`,
      metadata: { 
        bookingId: bookingId.toString() // 👈 CRITICAL: Must be a string
      },
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    res.json({ success: false, message: err.message });
  }
};