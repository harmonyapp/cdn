import path from "path";
import { CDN_DIRECTORY } from "./constants.js";

export function resolveImageDirectory(parentFolder, childFolder) {
    return path.resolve(CDN_DIRECTORY, parentFolder, childFolder);
}
