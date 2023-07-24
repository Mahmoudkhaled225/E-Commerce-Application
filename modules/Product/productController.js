import { nanoid } from "nanoid"
import slugify from "slugify"
import brandModel from "../../DB/models/brandModel.js";
import subCategoryModel from "../../DB/models/subCategoryModel.js";
import categoryModel from "../../DB/models/categoryModel.js";
import cloudinary from "../../services/cloudinary.js";
import AppError from "../../utils/ErrorHandling/AppError.js";
import productModel from "../../DB/models/productModel.js";

/**
 * @desc      Create a new product
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @property  { String } req.user
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   POST /ecommerce/v1/product/addproduct/:brandId
 * @access  Private

 */
export const addProduct = async (req, res, next) => {
    const { categoryId, subCategoryId, brandId} = req.params;
    const{name, price, discount ,stock } = req.body;
    const Category = await categoryModel.findById(categoryId);
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId });
    const brand = await brandModel.findOne({ _id: brandId });
    if (!Category || !subCategory || !brand)
        return next(new AppError('fail it could be no cate or subcate or brand to add under it this product',404));
    const obj = {...req.body,...req.params};

    obj.createdBy = req.user._id;
    obj.slug = slugify(name);

    obj.priceAfterDiscount = price * (1 - ((discount || 0) / 100));
    obj.customId = nanoid(5);

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: `${process.env.PROJECT_FOLDER}/Products/mainImgs/${obj.customId}`})
    obj.image = {
        path: secure_url,
        publicId: public_id
    };

    if (req.files.subImgs) {
        obj.subImgs = []
        for (const file of req.files.subImgs) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${process.env.PROJECT_FOLDER}/Products/subImgs/${obj.customId}`
            });
            obj.subImgs.push({
                path: secure_url,
                publicId: public_id
            });
        }
    }

    const product = await productModel.create(obj);
    if (!product) {
        //delete images (main img and subImgs) from cloudinary
        const arr = [];
        if (product.image.publicId) arr.push(product.image.publicId);
        if (product.subImgs.length > 0) {
            for (const img of product.subImgs)
                arr.push(img.publicId);
        }
        await cloudinary.api.delete_resources(arr);
        return next(new AppError('fail to create product',400));
    }
    return res.status(201).json({ message: "Done", product });
};

/**
 * @desc      update product
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   PATCH /ecommerce/v1/product/updateproduct/:productId
 * @access  Private
 *
 */
export const updateProduct = async (req, res, next) => {
    const { categoryId, subCategoryId, brandId,productId} = req.params;
    const Category = await categoryModel.findById(categoryId);
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId });
    const brand = await brandModel.findOne({ _id: brandId });
    if (!Category || !subCategory || !brand)
        return next(new AppError('fail it could be no cate or subcate or brand to update under it this product',404));
    const product = await productModel.findById(productId);
    if (!product) return next(new AppError('product is not exist',404));
    const obj = {...req.body};

    if(obj.name) obj.slug = slugify(obj.name);
    if(obj.description) obj.description = obj.description;
    if(obj.stock) obj.stock = obj.stock;

    if(obj.price)
        obj.priceAfterDiscount = obj.price * (1 - ((obj.discount || 0) / 100));
    if(!obj.discount) obj.discount = 0;

    if(req.files.image){
        await cloudinary.uploader.destroy(product.image.publicId);
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
            folder: `${process.env.PROJECT_FOLDER}/Products/mainImgs/${product.customId}`})
        obj.image = {
            path: secure_url,
            publicId: public_id
        };
    }
    if (req.files.subImgs) {
        for (const img of product.subImgs)
            await cloudinary.uploader.destroy(img.publicId);

        obj.subImgs = []
        for (const file of req.files.subImgs) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${process.env.PROJECT_FOLDER}/Products/subImgs/${product.customId}`
            });
            obj.subImgs.push({
                path: secure_url,
                publicId: public_id
            });
        }
    }

    obj.updatedBy = req.user._id;


    const flag = await product.updateOne({...obj});
    if(flag.modifiedCount===0)
        return next(new AppError("could not update product try again", 400));
    return res.status(200).json({"msg":"product updated successfully"});
};


/**
 * @desc      delete product
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   DELETE /ecommerce/v1/product/deleteproduct/:productId
 * @access  Private
 *
 */
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product)
        return next(new AppError('fail to find product',404));
    // const { image, subImgs } = product;
    // if (image.publicId)
    //     await cloudinary.uploader.destroy(image.publicId);
    // if (subImgs.length > 0) {
    //     for (const img of subImgs) {
    //         await cloudinary.uploader.destroy(img.publicId);
    //     }
    // }
    //or
    const arr = [];
    if (product.image.publicId) arr.push(product.image.publicId);

    if (product.subImgs.length > 0) {
        for (const img of product.subImgs)
            arr.push(img.publicId);
    }
    if(!arr) await cloudinary.api.delete_resources(arr);

    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Products/mainImgs/${product.customId}`);
    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Products/subImgs/${product.customId}`);

    const flag = await product.deleteOne();
    if(flag.deletedCount===0)
        return next(new AppError("could not delete product try again", 400));
    return res.status(200).json({ message: "Done deleted successfully" });
};

/**
 * @desc      get product info
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   GET /ecommerce/v1/product/getproduct/:productId
 * @access  Private
 *
 */

//populate ([ inside here just objs ])
export const getProduct = async (req, res, next) => {
    const { productId } = req.params;
    //populate and aggregate all fields
    //and ask amira populate here vs populate in category
    const product = await productModel.findById(productId)
        .populate([{path:'categoryId'},{path:'subCategoryId'},
            {path:'brandId'},{path:'createdBy'}, {path:'updatedBy'}]);
//aggregate([{lookup{}},{lookup{}}])
    // const product = await productModel.aggregate([
    //    {
    //         $lookup: {
    //             from: "categories",
    //             localField: "categoryId",
    //             foreignField: "_id",
    //             as: "category",
    //
    //         }
    //     },
    //
    //     {
    //         $lookup: {
    //             from: "brands",
    //             localField: "brandId",
    //             foreignField: "_id",
    //             as: "data",
    //              }
    //     }
    //     ]);
    if (!product)
        return next(new AppError('fail to find product',404));
    return res.status(200).json({ message: "Done", product });
}