// import multer from "multer";
// import path from "path";
// import fs from "fs/promises";

// const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
// const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
// const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// (async () => {
//     try {
//         await fs.mkdir(UPLOAD_DIR, { recursive: true });
//     } catch (err) {
//         console.error("Failed to create upload directory:", err);
//     }
// })();

// const storage = multer.diskStorage({
//     destination: (_req, _file, cb) => {
//         cb(null, UPLOAD_DIR);
//     },
//     filename: (_req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     },
// });

// function fileFilter(
//     _req: Express.Request,
//     file: Express.Multer.File,
//     cb: multer.FileFilterCallback
// ) {
//     if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(
//             new multer.MulterError(
//                 "LIMIT_UNEXPECTED_FILE",
//                 "Unsupported file type. Only JPEG, JPG, and PNG are allowed."
//             )
//         );
//     }
// }

// const upload = multer({
//     storage,
//     limits: { fileSize: MAX_FILE_SIZE },
//     fileFilter,
// });

// export default upload;


import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import config from "../config/app.config";

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, 
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only JPEG/PNG files are allowed"));
    },
});



export default upload;
