import Express from "express";
import { SECRET } from "./constants.js";

/**
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next 
 */
export function auth(req, res, next) {
    const suppliedSecret = req.headers.authorization;

    if (suppliedSecret !== SECRET) {
        const forbidden = 403;

        return res.status(forbidden).send("Forbidden.");
    }

    next();
}
