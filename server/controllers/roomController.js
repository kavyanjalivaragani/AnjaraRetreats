import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import { getClerkId } from "../middleware/authMiddleware.js";

// Api to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        
        // Use Clerk ID helper for owner lookup
        const ownerId = getClerkId(req);
        const hotel = await Hotel.findOne({ owner: ownerId });

        if (!hotel) return res.json({ success: false, message: "No Hotel Found" });

        // upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        });

        // wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: Number(pricePerNight), // + is fine, Number() is clearer
            amenities: JSON.parse(amenities),
            images,
        });
        
        res.json({ success: true, message: "Room Created Successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Api to get all rooms
export const getRooms = async (req, res) => {
    try {
        // FIXED: corrected createsAt to createdAt
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 }); 
        
        res.json({ success: true, rooms });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Api to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const ownerId = getClerkId(req);
        const hotelData = await Hotel.findOne({ owner: ownerId });
        
        if (!hotelData) return res.json({ success: false, message: "Hotel not found" });

        const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Api to TOGGLE availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        const room = await Room.findById(roomId);
        if (!room) return res.json({ success: false, message: "Room not found" });

        // Atomic update flips the current boolean value
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId, 
            { isAvailable: !room.isAvailable }, 
            { new: true } 
        );

        res.json({ 
            success: true, 
            message: `Room is now ${updatedRoom.isAvailable ? 'Available' : 'Unavailable'}`,
            isAvailable: updatedRoom.isAvailable 
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}