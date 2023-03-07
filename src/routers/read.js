import Express, { Router } from "express";
import path from "path";
import fs from "fs";
import { resolveImageDirectory } from "../helpers.js";
import { RESOURCES } from "../constants.js";

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
 * @param {Object} options
 * @param {string} options.resource
 * @returns {Promise<Express.RequestHandler>}
 */
function readImageHandler(options) {
    /**
     * @param {Express.Request<{ resourceId: string; }>} req
     * @param {Express.Response} res
     */
    return function handler(req, res) {
        const directory = resolveImageDirectory({ resource: options.resource, identifier: req.params.resourceId });
        const filename = req.params.imageHash + ".webp";
        const fullPath = path.join(directory, filename);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).send("Image not found.");
        }

        return res.sendFile(fullPath);
    }
}

router.get("/avatars/:resourceId/:imageHash.webp", validateParams, readImageHandler({ resource: RESOURCES.Avatars }));

router.get("/icons/:resourceId/:imageHash.webp", validateParams, readImageHandler({ resource: RESOURCES.Icons }));

export default router;
