import jwt from "jsonwebtoken";
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});

export const decodedToken = (payload = "") => {
    (!payload) && false;
    const decode = jwt.verify(payload, process.env.TOKEN_SIGNATURE);
    return decode;
};