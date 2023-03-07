import Express, { Router } from "express";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { resolveImageDirectory } from "../helpers.js";
import { RESOURCES } from "../constants.js";

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
 * A reusable function for handling image uploads
 * 
 * @param {Object} options
 * @param {string} options.resource The type of resource to read
 * @param {boolean} options.singleton A singleton resource means that there should only ever be one image in the directory at any given time
 * 
 * @returns {Promise<Express.RequestHandler>}
 */
function uploadImageHandler(options) {
    /**
     * @param {Express.Request<{ resourceId: string; }>} req
     * @param {Express.Response} res
     * @param {Express.NextFunction} next
     */
    return async function handler(req, res, next) {
        const outputDirectory = resolveImageDirectory({ resource: options.resource, identifier: req.params.resourceId });

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

        if (options.singleton === true) {
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

router.put("/avatars/:resourceId",
    imageUpload.single("avatar"),
    uploadImageHandler({ resource: RESOURCES.Avatars, singleton: true })
);

router.put("/icons/:resourceId",
    imageUpload.single("icon"),
    uploadImageHandler({ resource: RESOURCES.Icons, singleton: true })
);

router.use((err, req, res, next) => {
    const message = err.includes("Invalid file") ? "Invalid file" : "Unknown error";

    console.debug(err);

    res.status(400).send({ message });
});

export default router;
