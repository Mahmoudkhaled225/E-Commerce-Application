import appError from "../utils/ErrorHandling/AppError.js";

const authorization = (accessRoles) => {
    return (req, res, next) => {
        (accessRoles.includes(req.user.role))
            ?next()
            :next(new appError('Forbidden', 403))
    };
};

export default authorization;