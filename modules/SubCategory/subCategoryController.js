import subCategoryModel from "../../DB/models/subCategoryModel.js";
import slugify from "slugify";
import {nanoid} from "nanoid";
import categoryModel from "../../DB/models/categoryModel.js";
import AppError from "../../utils/ErrorHandling/AppError.js";
import cloudinary from "../../services/cloudinary.js";

/**
 * @desc      Create a new subcategory
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @property  { String } req.user
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   POST /ecommerce/v1/addsubcategory/:categoryId
 * @access  Private
 *
 */
export const createSubCategory = async (req, res, next) => {
    const { categoryId } = req.params
    const slug = slugify(req.body.name)
    const category = await categoryModel.findById(categoryId)
    if (!category)
        return next(new AppError("Category not found", 404));

    if (await subCategoryModel.findOne({name:req.body.name}))
        return next(new AppError("SubCategory already exists so you cant add it", 400));

    const customId = nanoid(5);
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
        {
            folder: `${process.env.PROJECT_FOLDER}/subcatgories/`
        }
    );
    const subCategory = await subCategoryModel.create({name:req.body.name,slug,customId,categoryId,
        image:{path:secure_url,publicId:public_id},
        createdBy: req.user._id
    });
    //I upload the image to cloudinary before creation
    //so if anything failed during make category in db
    //I will delete the image from cloudinary
    if (!subCategory) {
        await cloudinary.uploader.destroy(public_id)
        return next(new AppError("SubCategory creation failed try again plz", 400));
    }
    return res.status(201).json({ message: `subCategory ${subCategory.name} Added successfully`,subCategory});
}


/**
 * @desc      update Subcategory name and img
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   PATCH /ecommerce/v1/category/:categoryId/subcategory/updatesubcategory/:subcategoryId merge params
 * @access  Private
 *
 */
export const updateSubCategory = async (req, res, next) => {
    const {categoryId,subCategoryId} = req.params;
    if (!(await categoryModel.findById(categoryId)))
        return next(new AppError("no such category to add under it that subcategory",409));
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) return next(new AppError("no such subcategory to update",409));
    const obj = {...req.body};

    if(req.body.name){
        if(subCategory.name === req.body.name)
            return next(new AppError("plese change subCategory's name",409));
        if(await subCategoryModel.findOne(({name:req.body.name})))
            return next(new AppError("subCategory's name already exist",409));
        obj.name = req.body.name;
        obj.slug = slugify(req.body.name);
    }
    if(req.file) {
        await cloudinary.uploader.destroy(subCategory.image.publicId)
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,
            {
                folder: `${process.env.PROJECT_FOLDER}/subcatgories`
            });
        obj.image = {
            path: secure_url,
            publicId: public_id,
        };
    }

    const flag = await subCategory.updateOne({...obj}, { new: true });
    if(flag.modifiedCount===0)
        return next(new AppError("could not update sub categoy try again", 400));

    return res.status(200).json({"msg":"subCategory updated successfully","subCategory":subCategory});
};

/**
 * @desc      delete subcategory
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route DELETE /ecommerce/v1/subcategory/deletesubcategory/:subcategoryId
 * @access  Private
 *
 */
export const deleteSubCategory = async (req, res, next) => {
    const {subCategoryId} = req.params;
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if(!subCategory)
        return next(new AppError("SubCategory not found",404));
    await cloudinary.uploader.destroy(subCategory.image.publicId)
    await subCategory.deleteOne();
    return res.status(200).json({"msg":"subCategory deleted successfully"});
}


/**
 * @desc      get subcategory info
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   GET /ecommerce/v1/subcategory/getsubcategory/:subCategoryId and route of merge params
 * @access  Private
 *
 */
export const getSubCategory = async (req, res, next) => {
    const {subCategoryId} = req.params;
    const subCategory = await subCategoryModel.findById(subCategoryId).populate([{
        path: 'Brands'
    }]);

    if(!subCategory)
        return next(new AppError("SubCategory not found",404));
    return res.status(200).json({"msg":"here it is",subCategory});
};


export const getAllSubCategoriesAndBrands = async (req ,res ,next) => {
    const subCategories = await subCategoryModel.find({}).populate([{
        path: 'Brands'
    }]);
    if (!subCategories.length) {
        return res.status(200).json({ message: "Empty subCategories" })
    };
    return res.status(200).json({message: "Done", subCategories})
};