// get /api/user/
import User from "../models/User.js";
export const getUserData = async (req, res) => {
    try {
        // Ensure user exists on the request object
        if (!req.user) {
            return res.json({ success: false, message: "User not found" });
        }

        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({ success: true, role, recentSearchedCities });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// store user recent searched cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user; // Removed 'await' as req.user is an object, not a promise

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Logic to maintain only the last 3 cities
        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }

        await user.save();
        res.json({ success: true, message: "city added" });

    } catch (error) {
        console.error(error.message);
        // FIXED: Removed the extra ',message' that was causing the ReferenceError
        res.json({ success: false, message: error.message });
    }
}

// POST /api/user/sync - upsert user record from Clerk after login
import { getClerkId } from "../middleware/authMiddleware.js";

export const syncUser = async (req, res) => {
    try {
        const clerkId = getClerkId(req);
        if (!clerkId) return res.json({ success: false, message: 'Not authenticated' });

        const { email, username, image, role } = req.body;
        
        // Remove _id from the update object, it's already in the filter
        const userData = {
            email: email || '',
            username: username || 'Clerk User',
            image: image || '',
            role: role || 'user',
        };

        const user = await User.findOneAndUpdate(
            { _id: clerkId }, 
            { $set: userData }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('✅ User Synced successfully:', user._id);
        res.json({ success: true, user });
    } catch (err) {
        console.error('syncUser error:', err);
        res.json({ success: false, message: err.message });
    }
};