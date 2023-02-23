import path from "path";
import { CDN_DIRECTORY } from "./constants.js";

/**
 * @param {string} userId
 * @param {string} imageHash
 */
export function resolveAvatarPath(userId, imageHash) {
    const outputDirectory = path.resolve(CDN_DIRECTORY, "avatars", userId, "avatar");
    const outputPath = path.join(outputDirectory, imageHash);

    return {
        directory: outputDirectory,
        path: outputPath
    };
}
