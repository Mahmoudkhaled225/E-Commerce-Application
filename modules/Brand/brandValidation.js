import joi from "joi";
import {generalFields} from "../../middleware/validation.js";

export const addBrandValidation = joi.object({
    name: joi.string().required().min(1).max(32),
    file: generalFields.file.required(),
    subCategoryId: generalFields.id.required(),
    categoryId: generalFields.id.optional(),
});

export const updateBrandValidation = joi.object({
    name: joi.string().min(1).max(32),
    file: generalFields.file,
    subCategoryId: generalFields.id,
    categoryId: generalFields.id,
    brandId: generalFields.id,
});

export const deleteBrandValidation = joi.object({
    brandId: generalFields.id.required(),
});


export const getBrandValidation = joi.object({
    brandId: generalFields.id.required(),
});
