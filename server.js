// Set up an event listener for uncaught exceptions to log error information
// and terminate the Node.js process with an exit code of 1. This helps to
// ensure that the process stops running and does not continue to execute
// in an inconsistent state after an unhandled exception has occurred.


//    "express-graphql": "^0.12.0",??

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: ", err);
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});

import app from "./index.js";
import connectionDB from "./DB/connection.js";

// import path from "path";
// import {config} from "dotenv";
// config({path: path.resolve('config/dot.env')});
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import {config} from "dotenv";
config({path: path.join(__dirname,'./config/dot.env')});


const port = process.env.PORT || 8000;
const server = app.listen(port, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(`http://localhost:${process.env.PORT}${process.env.BASE_URL}`);
    await connectionDB();
});

// Handle unhandled Promise rejections by logging error information,
// shutting down the server gracefully, and waiting for any pending
// asynchronous operations to complete before exiting the process.
process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection: ", err);
    console.log(err.name, err.message, err.stack);
    server.close(() => {
        console.log("Server shut down easily");
        process.exit(1);
    });
});

