import User from "../models/User.js"

export const getClerkId = (req) => {
  // Supports various Clerk versions and manual overrides
  if (typeof req.auth === 'function') return req.auth().userId;
  if (req.auth?.userId) return req.auth.userId;
  if (req.user?.clerkId) return req.user.clerkId;
  if (req.user?._id) return req.user._id;
  return null;
}

export const protect = async (req, res, next) => {
  try {
    const clerkId = getClerkId(req);
    
    if (!clerkId) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please login." });
    }

    // Look up user by Clerk ID (which we store as the MongoDB _id)
    const user = await User.findById(clerkId);

    if (!user) {
      // If user isn't in DB yet, we provide a temporary Mongoose-like structure
      // But we alert the logs so you know the sync hasn't happened yet.
      console.warn(`⚠️ User ${clerkId} not found in MongoDB. Ensure syncUser is called.`);
      
      req.user = new User({ 
        _id: clerkId, 
        role: "user", 
        recentSearchedCities: [],
        email: "syncing..." 
      });
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Critical Auth Middleware Error:", error);
    res.status(500).json({ success: false, message: "Internal server authentication error" });
  }
}