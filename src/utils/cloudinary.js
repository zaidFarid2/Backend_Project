import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async function(localFilePath) {
    if (!localFilePath) {
        console.error("No local file path provided.");
        return null;
    }

    // Resolve and log the absolute file path
    const absoluteFilePath = path.resolve(localFilePath);
    console.log('Resolved file path:', absoluteFilePath);

    // Check if the local file exists
    if (!fs.existsSync(absoluteFilePath)) {
        console.error(`Local file does not exist: ${absoluteFilePath}`);
        return null;
    }

    try {
        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(absoluteFilePath, {
            resource_type: "auto",
        });

        console.log(`File uploaded to Cloudinary: ${response.url}`);

        // Remove local file after successful upload
        fs.unlinkSync(absoluteFilePath);

        return response;

    } catch (error) {
        console.error(`Error uploading file to Cloudinary: ${error.message}`);

        // Remove local file if upload fails
        if (fs.existsSync(absoluteFilePath)) {
            fs.unlinkSync(absoluteFilePath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
