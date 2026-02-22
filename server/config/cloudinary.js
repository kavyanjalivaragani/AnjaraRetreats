import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            // FIXED: Changed API_KEY to API_SECRET
            api_secret: process.env.CLOUDINARY_API_SECRET, 
        });
        console.log("Cloudinary Configured Successfully");
    } catch (error) {
        console.error("Cloudinary Configuration Error:", error.message);
    }
}

export default connectCloudinary;