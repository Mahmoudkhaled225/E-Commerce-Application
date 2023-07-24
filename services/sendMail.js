import nodemailer from "nodemailer";
import path from "path";
import {config} from "dotenv";
config({path: path.resolve('config/dot.env')});

const sendEmail = async ({ to = "", message = "", subject = "" }) => {
    // connection configuration
    let transporter = nodemailer.createTransport({
        host: "localhost",  // stmp.gmail.com
        port: 587, // 465,
        secure: false, // true  TLS,
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASS,
        },
    });
    let info = await transporter.sendMail({from: process.env.SENDER_EMAIL,to,subject, html: message,});
    //return !!info.accepted.length;
    if(info.accepted.length)
        return true;
    return false;
};

export default sendEmail;