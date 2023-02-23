import { Router } from "express";
import fs from "fs";
import { resolveAvatarPath } from "../helpers.js";

const router = Router();

router.get("/avatars/:userId/:imageHash.webp", (req, res) => {
    const regex = /[a-zA-Z0-9\.]/;

    const userId = req.params.userId;
    const imageHash = req.params.imageHash;

    if (!regex.test(userId) || !regex.test(imageHash)) {
        return res.status(400).send("Invalid userId or imageHash supplied.");
    }

    const { path } = resolveAvatarPath(userId, imageHash + ".webp");

    if (!fs.existsSync(path)) {
        return res.status(404).send("File not found");
    }

    return res.sendFile(path);
});

export default router;
