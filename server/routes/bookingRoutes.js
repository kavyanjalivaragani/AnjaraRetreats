import express from 'express';
import { 
    checkAvailabilityAPI,
    createBooking,
    getHotelBookings,
    getUserBookings,
    StripePayment
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post('/book', protect, createBooking);

// Change these to GET if you are fetching lists
bookingRouter.get('/user', protect, getUserBookings); 
bookingRouter.get('/hotel', protect, getHotelBookings); // <--- CHANGED TO GET

bookingRouter.post('/stripe-payment',protect,StripePayment);

export default bookingRouter;