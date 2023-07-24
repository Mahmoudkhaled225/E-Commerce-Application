import AppError from "../utils/ErrorHandling/AppError.js";
import userModel from "../DB/models/userModel.js";
import {decodedToken} from "../utils/token/decodedToken.js";

const authentication = () => {
    return async (req, res, next) => {
        const { token } = req.headers;
        (!token)&&next( new AppError("please enter your token" , 400));
        const decode = decodedToken(token);
        (!decode || !decode.id)&& next(new AppError("in-valid token" , 400));
        const user = await userModel.findById(decode.id);
        (!user)&&next(new AppError("not authorized" , 400));
        req.user = user;
        next();
    };
};
export default authentication;
