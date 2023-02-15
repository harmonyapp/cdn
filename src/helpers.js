import path from "path";

/**
 * @param {string} userId
 * @param {string} imageHash
 */
export function resolveAvatarPath(userId, imageHash) {
    const outputDirectory = path.resolve(path.dirname(""), "uploads", userId, "avatar");
    const outputPath = path.join(outputDirectory, imageHash);

    return {
        directory: outputDirectory,
        path: outputPath
    }
}
