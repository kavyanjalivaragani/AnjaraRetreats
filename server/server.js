import "dotenv/config"; 
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripewebhooks.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import connectCloudinary from "./config/cloudinary.js";

// Import DNS to bypass network blocks
import dns from 'node:dns';

const app = express();

// --- 1. Middleware Setup ---

const allowed = [
  "https://anjararetreats.vercel.app",
  "https://anjara-retreats.vercel.app",
  "http://localhost:5173"
];

app.use(cors({ 
    origin: (origin, callback) => {
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }, 
    credentials: true 
}));

// Webhooks must be BEFORE express.json()
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.post("/api/clerk/webhook", express.raw({ type: "application/json" }), clerkWebhooks);

app.use(express.json());
app.use(clerkMiddleware());

// --- 2. Routes ---

app.get("/", (req, res) => res.send("API IS WORKING"));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// --- 3. Server Startup Logic ---

const startServer = async () => {
    try {
        // --- FIX FOR ECONNREFUSED ---
        // Force Node to use Google DNS to bypass ISP/Network blocks on MongoDB SRV
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        
        console.log("⏳ Checking environment variables...");
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in your .env file!");
        }

        console.log("⏳ Connecting to Database...");
        await connectDB();
        
        console.log("⏳ Connecting to Cloudinary...");
        await connectCloudinary();

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log("✅ All systems go.");
        });
        
    } catch (error) {
        console.error("❌ Critical: Server failed to start:");
        console.error(error.message);
        
        // Detailed troubleshooting for the common DNS error
        if (error.message.includes("ECONNREFUSED")) {
            console.log("\n--------------------------------------------------");
            console.log("💡 NETWORK BLOCK DETECTED:");
            console.log("1. Ensure your IP is whitelisted in MongoDB Atlas (Network Access -> Add 0.0.0.0/0)");
            console.log("2. If on a mobile hotspot, try the 'Node.js 2.2.12' connection string in Atlas.");
            console.log("--------------------------------------------------\n");
        }
        
        process.exit(1); 
    }
};

startServer();