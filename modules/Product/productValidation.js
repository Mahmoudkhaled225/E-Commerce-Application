import joi from "joi";
import {generalFields} from "../../middleware/validation.js";

export const addProductValidation = joi.object({
    name: joi.string().required().min(1).max(32),
    description: joi.string().optional().min(1).max(56),
    stock: joi.number().positive().required(),
    price: joi.number().positive().required(),
    discount: joi.number().positive().optional(),
    priceAfterDiscount: joi.number().positive().optional(),
    file: joi.object({
        image: joi.array().items(generalFields.file.required()).required(),
        subImgs: joi.array().items(generalFields.file.required()).optional(),
    }).required(),
    categoryId: generalFields.id.required(),
    subCategoryId: generalFields.id.required(),
    brandId: generalFields.id.required(),
});

export const updateProductValidation = joi.object({
    name: joi.string().optional().min(1).max(32),
    description: joi.string().optional().min(1).max(56),
    stock: joi.number().positive().optional(),
    price: joi.number().positive().optional(),
    discount: joi.number().positive().optional(),
    file: joi.object({
        image: joi.array().items(generalFields.file.optional()).optional(),
        subImgs: joi.array().items(generalFields.file.optional()).optional(),
    }).optional(),
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
});
