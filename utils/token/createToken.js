import jwt from "jsonwebtoken";
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});


export const createToken = (payload = {}) => {
    (!Object.keys(payload).length) && false;
    return jwt.sign(payload, process.env.TOKEN_SIGNATURE,
        {expiresIn: process.env.TOKEN_EXPIRE} );
};
