import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { getClerkId } from "../middleware/authMiddleware.js";

export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        
        // Use helper to get Clerk ID (works whether req.auth() or req.user exists)
        const ownerId = getClerkId(req);

        if (!ownerId) return res.json({ success: false, message: "Unauthorized" });

        // 1. Check if this Clerk user already has a hotel
        const existingHotel = await Hotel.findOne({ owner: ownerId });
        if (existingHotel) {
            return res.json({ success: false, message: "Hotel Already Registered" });
        }

        // 2. Create the Hotel using the Clerk ID
        await Hotel.create({ 
            name, 
            address, 
            contact, 
            city, 
            owner: ownerId 
        });

        // 3. Update the User role (optional: use try/catch here in case webhook is slow)
        try {
            await User.findByIdAndUpdate(ownerId, { role: "hotelOwner" });
        } catch (updateError) {
            console.log("User record not in DB yet, role will sync via webhook later.");
        }

        res.json({ success: true, message: "Hotel Registered Successfully" });

    } catch (error) {
        console.error("Hotel Registration Error:", error);
        res.json({ success: false, message: error.message });
    }
}