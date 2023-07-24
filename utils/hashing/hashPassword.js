import bcrypt from "bcryptjs";
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});


export const hashPassword = (pass,saltRound=+process.env.SALT_ROUNDS) => {
    return bcrypt.hashSync(pass, saltRound);
};

