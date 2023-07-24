import subCategoryModel from "../../DB/models/subCategoryModel.js";
import brandModel from "../../DB/models/brandModel.js";
import {nanoid} from "nanoid";
import cloudinary from "../../services/cloudinary.js";
import slugify from "slugify";
import AppError from "../../utils/ErrorHandling/AppError.js";
import categoryModel from "../../DB/models/categoryModel.js";


/**
 * @desc      Create a new brand
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @property  { String } req.user
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   POST /ecommerce/v1/brand/addbrand/:categoryId
 * @access  Private

 */
export const addBrand = async(req,res,next)=>{
    const {name} = req.body;
    const {subCategoryId} = req.params;
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if(!subCategory)
        return next(new AppError("no subcategory found",400));
    if(await brandModel.findOne({name,subCategoryId}))
        return next(new AppError("brand is already exist",400));
    const customId = nanoid(5);
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
        {
            folder: `${process.env.PROJECT_FOLDER}/brands`
        });
    const brand = await brandModel.create({
        name,
        subCategoryId,
        customId,
        image:{path:secure_url,publicId:public_id},
        slug: slugify(name),
        createdBy: req.user._id,
    });
    return res.status(200).json({message: `brand ${name} Added successfully` ,brand});
};


/**
 * @desc      update brand name and img
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   PATCH /ecommerce/v1/brand/updatebrand/:brandId
 * @access  Private
 *
 */
export const updateBrand = async (req, res, next) => {
    const {categoryId,subCategoryId,brandId} = req.params;
    if (!(await categoryModel.findById(categoryId))) return next(new AppError("no such category to add under it that subcategory then add brand",409));
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) return next(new AppError("no  such subcategory to add  under it brand",409));
    const brand = await brandModel.findById(brandId);
    if (!brand) return next(new AppError("no such brand to update",409));
    const obj = {...req.body};

    if(req.body.name){
        if(brand.name === req.body.name)
            return next(new AppError("plese change Brand's name",409));
        if(await brandModel.findOne(({name:req.body.name})))
            return next(new AppError("Brand's name already exist",409));
        obj.name = req.body.name;
        obj.slug = slugify(req.body.name);
    }
    if(req.file) {
        await cloudinary.uploader.destroy(brand.image.publicId)
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,
            {
                folder: `${process.env.PROJECT_FOLDER}/brands`
            });
        obj.image = {
            path: secure_url,
            publicId: public_id,
        };
    }
    const flag = await brand.updateOne({...obj});
    if(flag.modifiedCount===0)
        return next(new AppError("could not update sub categoy try again", 400));
    return res.status(200).json({"msg":"brand updated successfully","brand":brand});
};

/**
 * @desc      delete brand
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   DELETE /ecommerce/v1/brand/deletebrand/:brandId
 * @access  Private
 *
 */
export const deleteBrand = async (req, res, next) => {
    const {brandId} = req.params;
    const brand = await brandModel.findById(brandId);
    if (!brand) return next(new AppError("no such brand to delete",409));
    await cloudinary.uploader.destroy(brand.image.publicId);
    const flag = await brand.deleteOne();
    if(flag.deletedCount===0)
        return next(new AppError("could not delete brand try again", 400));
    return res.status(200).json({"msg":"brand deleted successfully"});
}


/**
 * @desc      get brand info
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   GET /ecommerce/v1/brand/getbrand/:brandId and route of merge params
 * @access  Private
 *
 */
export const getBrand = async (req, res, next) => {
    const {brandId} = req.params;
    const brand = await brandModel.findById(brandId)

    if(!brand)
        return next(new AppError("brand not found",404));
    return res.status(200).json({"msg":"here it is",brand});
};



//here it has to be nested populate cause cate are in subCate it is not in brand
export const getAllBrands = async (req, res, next) =>{
    const brands = await brandModel.find({}).
    populate([{path: 'subCategoryId', populate: [{path: 'categoryId'}]}]);
    return res.json({brands});
};


//populate ([ inside here just objs ])