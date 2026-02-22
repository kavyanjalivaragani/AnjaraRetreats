import Stripe from "stripe";
import Booking from "../models/booking.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body must be the RAW buffer from express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("🔔 Stripe Event Received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Check if metadata exists
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        // Use findOneAndUpdate to ensure we match the ID correctly
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            isPaid: true,
            paymentMethod: "Stripe", // Overwrites "Pay At Hotel"
            status: "booked"         // Changes from "pending"
          },
          { new: true } 
        );

        if (updatedBooking) {
          console.log("✅ Booking Updated in DB:", updatedBooking._id);
          console.log("💰 Payment Method now:", updatedBooking.paymentMethod);
        } else {
          console.error("❌ Booking ID found in metadata, but not found in Database.");
        }
      } catch (dbError) {
        console.error("❌ Database update failed:", dbError.message);
      }
    } else {
      console.error("❌ No bookingId found in session metadata! Check your Stripe Session creation code.");
    }
  }

  // Always return 200 to Stripe to acknowledge receipt
  res.status(200).json({ received: true });
};