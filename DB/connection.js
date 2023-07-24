import mongoose from 'mongoose';

// import {config} from "dotenv";
// config({path:"./config/dot.env" });
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});

const connectionDB = async () => {
    return await mongoose
        .connect(process.env.DB_local, )
        .then(() => console.log("DB connection successful!"))
        .catch((err) => console.log(err));
};

mongoose.set("strictQuery", true);
export default connectionDB;