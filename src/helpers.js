import path from "path";
import { CDN_DIRECTORY } from "./constants.js";

/**
 * Resolves the directory for an image, given the resource and identifier
 * @param {Object} options 
 * @param {string} options.resource
 * @param {string} options.identifier
 * 
 * @returns {string}
 */
export function resolveImageDirectory(options) {
    return path.resolve(CDN_DIRECTORY, options.resource, options.identifier);
}
