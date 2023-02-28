import Express, { Router } from "express";
import path from "path";
import fs from "fs";
import { resolveImageDirectory } from "../helpers.js";
import { CDN_FOLDERS } from "../constants.js";

const router = Router();

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next 
 */
function validateParams(req, res, next) {
    const regex = /^[a-zA-Z0-9]+$/;

    for (const param in req.params) {
        const valid = regex.test(req.params[param]);

        if (!valid) return res.status(400).send("Invalid parameters");
    }

    next();
}

/**
 * 
 * @param {import("./write.js").directoryResolver} directoryResolver
 * @returns {Promise<Express.RequestHandler>}
 */
function readImageHandler(directoryResolver) {
    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    return function handler(req, res) {
        const directory = directoryResolver(req);
        const filename = req.params.imageHash + ".webp";
        const fullPath = path.join(directory, filename);

        console.debug("Resolved directory to", fullPath)

        if (!fs.existsSync(fullPath)) {
            return res.status(404).send("Image not found.");
        }

        return res.sendFile(fullPath);
    }
}

router.get("/avatars/:userId/:imageHash.webp", validateParams, readImageHandler((req) => resolveImageDirectory(CDN_FOLDERS.Avatars, req.params.userId)));

router.get("/icons/:iconId/:imageHash.webp", validateParams, readImageHandler((req) => resolveImageDirectory(CDN_FOLDERS.Icons, req.params.iconId)));

export default router;
