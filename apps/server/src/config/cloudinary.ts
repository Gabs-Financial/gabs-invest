// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import config from "./app.config";
import { systemLogger } from "../utils/logger";
import { Readable } from "stream";

if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary configuration in environment variables.");
}

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary under a folder.
 * @param localFilePath - Full local path to the file
 * @param folder - Optional folder name in Cloudinary (defaults to 'soranix')
 */

// const uploadToCloudinary = async (
//     localFilePath: string,
//     folder: string = "gabs"
// ): Promise<{ success: boolean; url?: string; message?: string }> => {
//     try {
//         const filename = path.basename(localFilePath);
//         const cloudPath = `${folder}/${filename}`;

//         const result = await cloudinary.uploader.uupload(localFilePath, {
//             public_id: cloudPath,
//         });

//         await fs.unlink(localFilePath); 

//         return {
//             success: true,
//             url: result.secure_url,
//         };
//     } catch (error) {
//         systemLogger.error("Cloudinary upload failed:", error);

//         try {
//             await fs.unlink(localFilePath);
//         } catch (fsErr) {
//             systemLogger.warn("Failed to remove local file after Cloudinary error:", fsErr);
//         }

//         return {
//             success: false,
//             message: "Cloudinary upload failed",
//         };
//     }
// };

// export default uploadToCloudinary;


export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    filename: string
): Promise<{ url: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: `soranix/${filename}`, resource_type: "image" },
            (error, result) => {
                if (error || !result) return reject(error);
                resolve({ url: result.secure_url });
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};