import categoryModel from "../../DB/models/categoryModel.js";
import AppError from "../../utils/ErrorHandling/AppError.js";
import slugify from "slugify";
import cloudinary from "../../services/cloudinary.js";
import {nanoid} from "nanoid";
import ApiFeatures from "../../services/ApiFeatures.js";

import path from "path";
import {config} from "dotenv";
import userModel from "../../DB/models/userModel.js";
config({path: path.resolve('config/dot.env')});


/**
 * @desc      Create a new category
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @property  { String } req.user
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   POST /ecommerce/v1/category/add-category
 * @access  Private

 */
export const createCategory = async (req, res, next) => {
    const id = req.user._id;
    const checkCategory = await categoryModel.findOne({name:req.body.name});
    if(checkCategory)
        return next(new AppError("Category already exists so you cant add it ", 400));
    if(!req.file)
        return next(new AppError("Please upload a category image"), 400);
    const slug = slugify(req.body.name, { lower: true /*,replacment : "_"*/});

    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
        {
            folder:`${process.env.PROJECT_FOLDER}/categories`
        });
    const category = await categoryModel.create({name:req.body.name, slug,
        customId:nanoid(5),
        createdBy:id,
        image:{path:secure_url,publicId:public_id}});
    //I upload the image to cloudinary before creation
    //so if anything failed during make category in db
    //I will delete the image from cloudinary
    if(!category ) {
        await cloudinary.uploader.destroy(public_id);
        return next(new AppError("Category creation failed", 400));
    }
    return res.status(201).json({"msg":"Category created successfully","category":category});
};


/**
 * @desc      update category name img
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 *
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   PUT /ecommerce/v1/category/updatecategory/:categoryID
 * @access  Private

 */
export const updateCategory = async (req, res, next) =>{
    const id = req.user._id;
    const {categoryId} = req.params;
    const category = await categoryModel.findById(categoryId);
    if(!category)
        return next(new AppError("Category not found add then update it",404));
    const obj = {...req.body};

    if(req.body.name){
        if(category.name === req.body.name)
            return next(new AppError("plese change category's name",409));
        if(await categoryModel.findOne(({name:req.body.name})))
            return next(new AppError("category's name already exist",409))
        obj.name = req.body.name;
        obj.slug = slugify(req.body.name);
    }
    if(req.file)
    {
        await cloudinary.uploader.destroy(category.image.publicId)
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,
            {
                folder:`${process.env.PROJECT_FOLDER}/categories`
            });
        obj.image={
            path : secure_url,
            publicId :public_id ,
        };
    }
    obj.updatedBy = id;

    const flag = await category.updateOne({...obj}, { new: true });
    if(flag.modifiedCount===0)
        return next(new AppError("could not update categoy try again", 400));

    return res.status(200).json({"msg":"Category updated successfully","category":category});
};

/**
 * @desc      delete category
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @property  { String } req.user
 * @returns   { JSON } - A JSON object representing the type, message and the created Category
 * @route   DELETE /ecommerce/v1/category/deletecategory/:categoryID
 * @access  Private
 */
export const deleteCategory = async (req, res, next) => {
    const {categoryId} = req.params;
    const category = await categoryModel.findByIdAndDelete(categoryId);
    if(!category)
        return next(new AppError("Category not found so you cant delete it ",404));
    else{
        await cloudinary.uploader.destroy(category.image.publicId);
        return res.json({message: "you are deleted Done"});
    }
    return next(new AppError("error happend try again please ",404));
};



//vitual populate all cats and subcats
export const getAllCategoriesAndSubCates = async (req ,res ,next) => {
    const categories = await categoryModel.find({}).populate([{
        path: 'SubCategories'
    }]);
    if (!categories.length) {
        return res.status(200).json({ message: "Empty categories" })
    };
    return res.status(200).json({message: "Done", categories})
};


// get one category info and get its subcategory info and brand info
export const getCategoryInfo = async (req, res, next) =>{
    //way 1 by virtual populate in category model and subcategory model and brand model
    const {categoryId} = req.params;
    const category = await categoryModel.findById(categoryId).
    populate([{path: 'SubCategories', populate: [{path: 'Brands'}]}]).lean();
    //way 2 by for of  it need some customization to make output like way 1
//    const category = await categoryModel.findById(categoryId);
//    const subCategory = await subCategoryModel.find({categoryId:category._id});
//    let brands = [];
//    for(const subcate of subCategory){
//        const brand = await brandModel.find({subCategoryId:subcate._id});
//        brands.push(brand);}
//    category.subCategory = subCategory;
//    category.subCategory.brands = brands;
    //way 3 by cursor it need some customization to make output like way 1
//    let arr = [];
//    const category = await categoryModel.findById(categoryId);
//    const subCategory = await subCategoryModel.find({categoryId:category._id});
//    let brands = [];
    // cursor
//    const cursor = subCategoryModel.find({categoryId:category._id}).cursor();
//    for (let subcate = await cursor.next(); subcate != null; subcate = await cursor.next()){
//        const brand = await brandModel.find({subCategoryId:subcate._id});
//        brands.push(brand);
//    };
//    arr.push({category,subCategory,brands});
//    return res.json({arr});

    return res.json({category})
};


export const getAllCategoriesInfoWithAllSubCategoriesAndBrands = async (req, res, next) =>{
    const categories = await categoryModel.find({}).
    populate([{path: 'SubCategories', populate: [{path: 'Brands'}]}]);
    return res.json({categories});
};
