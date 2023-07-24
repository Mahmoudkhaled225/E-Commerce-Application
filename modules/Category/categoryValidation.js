import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

export const createCategoryValidation = joi.object({
    name: joi.string().required().max(32).min(1),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.required(),
    //id:generalFields.id.required()
}).required();

export const updateCategoryValidation = joi.object({
    name: joi.string().max(32).min(1).optional(),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.optional(),
    categoryId: generalFields.id.required(),
}).required();


export const deleteCategoryValidation = joi.object({
    categoryId: generalFields.id.required()
}).required();