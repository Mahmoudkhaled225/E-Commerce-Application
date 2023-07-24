import AppError from "../utils/ErrorHandling/AppError.js";

const handleJWTError = () => {
    const message = `Invalid token. Please login again!`;
    new AppError(message, 401);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = function (err) {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value`;
    return new AppError(message, err.statusCode);
};

const handleUnexpectedFields = function (err) {
    const message = `Number of fields exceeded the max count`;
    return new AppError(message, err.statusCode);
};

const handleInvalidFileFormat = function (err) {
    const message = "File format is not supported";
    return new AppError(message, 415);
};

const handleTokenExpiredError = function (err) {
    const message = "Token has expired. Please login again!";
    return new AppError(message, 400);
};

const errorHandlerMW = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";

    let error = { ...err };
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.code === "LIMIT_UNEXPECTED_FILE") error = handleUnexpectedFields(err);
    if (err.message === "Invalid file format") error = handleInvalidFileFormat(err);
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    res.status(err.statusCode).json({err, message: err.message, stack: err.stack});
};

export default errorHandlerMW;