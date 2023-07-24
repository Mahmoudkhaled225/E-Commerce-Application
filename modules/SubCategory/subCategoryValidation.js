import joi from "joi";
import {generalFields} from "../../middleware/validation.js";

export const createSubCategoryValidation = joi.object({
    name: joi.string().required().min(1).max(32),
    file: generalFields.file.required(),
    categoryId: generalFields.id.required(),
});

export const updateSubCategoryValidation = joi.object({
    name: joi.string().optional().min(1).max(32),
    file: generalFields.file.optional(),
    categoryId: generalFields.id.required(),
    subCategoryId: generalFields.id.required(),
});

export const getSubCategoryValidation = joi.object({
    subCategoryId: generalFields.id.required(),
    categoryId: generalFields.id.optional(),
});

export const deleteSubCategoryValidation = joi.object({
    subCategoryId: generalFields.id.required(),
});