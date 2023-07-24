import {Router} from "express";
const categoryRouter = Router();
import * as categoryController from "./categoryController.js";
import {validation} from "../../middleware/validation.js";
import * as validators from "./categoryValidation.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import {fileUpload} from "../../services/multer.js";
import authentication from "../../middleware/authentication.js";
import authorization from "../../middleware/authorization.js";
import accessRoles from "../EndPoints.js";
import subCategoryRouter from "../SubCategory/subCategoryRouter.js";


//mergeParams
categoryRouter.use("/:categoryId/subcategory",subCategoryRouter);


categoryRouter.post("/createcategory",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.createCategoryValidation),
    asyncHandler(categoryController.createCategory));

categoryRouter.patch("/updatecategory/:categoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.updateCategoryValidation),
    asyncHandler(categoryController.updateCategory));

categoryRouter.delete("/deletecategory/:categoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.deleteCategoryValidation),
    asyncHandler(categoryController.deleteCategory));




categoryRouter.get("/getcatwithsubcats",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    asyncHandler(categoryController.getAllCategoriesAndSubCates));

/////////mahmoud Routes
categoryRouter.get("/get/:categoryId",
    // asyncHandler(authentication()),
    // authorization(accessRoles.admin),

    asyncHandler(categoryController.getCategoryInfo));

categoryRouter.get("/getall",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    asyncHandler(categoryController.getAllCategoriesInfoWithAllSubCategoriesAndBrands));



export default categoryRouter;