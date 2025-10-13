import { v2 as cloudinary } from "cloudinary"

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY  // This is wrong
        });
        // Test connection
        await cloudinary.api.ping();
        console.log('Cloudinary connected successfully');
    } catch (error) {
        console.error('Cloudinary connection failed:', error);
        process.exit(1);
    }
}
export default connectCloudinary;