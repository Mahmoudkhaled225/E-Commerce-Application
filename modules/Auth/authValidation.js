import joi from "joi";
import {generalFields} from "../../middleware/validation.js";
import {addProfileImgWhileLogIn} from "./authController.js";

export const signUpValidation = joi.object({
    name: joi.string().min(2).max(32).required(),
    email: generalFields.email,
    password: generalFields.password,
    confirmationPassword: generalFields.confirmationPassword,
    age: joi.number().min(18).required(),
    phone:generalFields.phone,
});

export const confirmEmailValidation = joi.object({
    token : joi.string().required()
});

export const addProfileImgValidation = joi.object({
    token : joi.string().required(),
    file: generalFields.file,
});


export const loginValidation = joi.object({
    email: generalFields.email,
    password: generalFields.password,
});


export const addProfileImgWhileLogInValidation = joi.object({
    file:generalFields.file,
});


export const updateProfileImgValidation = joi.object({
    file:generalFields.file,
});


export const sendCodeToForgetPasswordValidation = joi.object({
    email: generalFields.email,
});

export const actualForgetPasswordLogicValidation = joi.object({
    email: generalFields.email,
    forgetPasswordCode: joi.string().min(6).max(6).required(),
    newPassword: generalFields.newPassword,
    newConfirmationPassword: generalFields.newConfirmationPassword,
});

export const updatePasswordValidation = joi.object({
    currentPassword: generalFields.password,
    newPassword: generalFields.password,
    newConfirmationPassword: generalFields.newConfirmationPassword,
});

export const undoSoftDeleteSendMailvaldiation = joi.object({
    email: generalFields.email,
});

export const undoSoftDeletevaldiation = joi.object({
    email: generalFields.email,
    undoIsDeletedCode: joi.string().min(6).max(6).required(),
});


export const updateProfileValidation = joi.object({
    name: joi.string().min(2).max(32).optional(),
    age: joi.number().min(18).optional(),
    phone:generalFields.phone,
});