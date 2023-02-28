import Express, { Router } from "express";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { resolveImageDirectory } from "../helpers.js";
import { CDN_FOLDERS } from "../constants.js";

const EIGHT_MB = 8000000;

const router = Router();

const imageUpload = multer({
    limits: {
        fileSize: EIGHT_MB
    },
    fileFilter: function (req, file, cb) {
        const allowedMimes = /jpeg|jpg|png|gif|webp/;
        const mime = file.mimetype;

        if (!allowedMimes.test(mime)) {
            return cb("Invalid file");
        }

        cb(null, true);
    }
});

/**
 * @callback directoryResolver
 * @param {Express.Request} req
 * @returns {string}
 */

/**
 * 
 * @param {directoryResolver} outputResolver
 * @param {boolean} singleton Whether or not we should clear the outputDirectory
 * @returns {Promise<Express.RequestHandler>}
 */
function uploadImageHandler(outputResolver, singleton) {
    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @param {Express.NextFunction} next
     */
    return async function handler(req, res, next) {
        const outputDirectory = outputResolver(req);

        if (!req.file) {
            return next("File is required");
        }

        const imageHash = crypto.createHash("md5").update(req.file.buffer).digest("hex");

        let buffer;

        try {
            buffer = await sharp(req.file.buffer)
                .resize(256, 256, {
                    fit: "cover"
                })
                .webp()
                .toBuffer();
        } catch (error) {
            return res.status(400).send({
                message: "Error while uploading image",
                error: error.toString()
            });
        }

        if (singleton === true) {
            const existingDirectory = fs.existsSync(outputDirectory);

            if (existingDirectory) {
                fs.rmSync(outputDirectory, {
                    force: true,
                    recursive: true
                });
            }
        }

        const outputPath = path.join(outputDirectory, imageHash + ".webp");

        fs.mkdirSync(outputDirectory, { recursive: true });
        fs.writeFileSync(outputPath, buffer);

        return res.status(201).send({
            imageHash
        });
    }
}

router.put("/avatars/:userId",
    imageUpload.single("avatar"),
    uploadImageHandler((req) => resolveImageDirectory(CDN_FOLDERS.Avatars, req.params.userId), true)
);

router.put("/icons/:serverId",
    imageUpload.single("icon"),
    uploadImageHandler((req) => resolveImageDirectory(CDN_FOLDERS.Icons, req.params.serverId), true)
);

router.use((err, req, res, next) => {
    const message = err.includes("Invalid file") ? "Invalid file" : "Unknown error";

    console.debug(err);

    res.status(400).send({ message });
})

export default router;
