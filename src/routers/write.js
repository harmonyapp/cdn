import { Router } from "express";
import fs from "fs";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { resolveAvatarPath } from "../helpers.js";

const EIGHT_MB = 8000000;

const router = Router();

const avatarUpload = multer({
    limits: {
        fileSize: EIGHT_MB
    },
    fileFilter: function (req, file, cb) {
        const allowedMimes = /jpeg|jpg|png|gif/;
        const mime = file.mimetype;

        if (!allowedMimes.test(mime)) {
            return cb("Invalid file");
        }

        cb(null, true);
    }
});

router.put("/avatars/:userId", avatarUpload.single("avatar"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "File is required" });
    }

    const { userId } = req.params;
    const imageHash = crypto.createHash("md5").update(req.file.buffer).digest("hex");

    const avatarBuffer = await sharp(req.file.buffer)
        .resize(256, 256, {
            fit: "cover"
        })
        .png()
        .toBuffer();

    const {
        directory: outputDirectory,
        path: outputPath
    } = resolveAvatarPath(userId, imageHash);

    const existingDirectory = fs.existsSync(outputDirectory);

    if (existingDirectory) {
        fs.rmSync(outputDirectory, {
            force: true,
            recursive: true
        });
    }

    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(outputPath + ".png", avatarBuffer);

    return res.status(201).send({
        imageHash
    });
});

router.use((err, req, res, next) => {
    const message = err.includes("Invalid file") ? "Invalid file" : "Unknown error";

    res.status(400).send({ message });
})

export default router;
