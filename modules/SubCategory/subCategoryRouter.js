import {Router} from "express";
const subCategoryRouter = Router({mergeParams: true});
import * as subCategoryController from "./subCategoryController.js";
import {validation} from "../../middleware/validation.js";
import * as validators from "./subCategoryValidation.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import {fileUpload} from "../../services/multer.js";
import authentication from "../../middleware/authentication.js";
import authorization from "../../middleware/authorization.js";
import accessRoles from "../EndPoints.js";
import brandRouter from "../Brand/brandRouter.js";
import {getAllSubCategoriesAndBrands} from "./subCategoryController.js";

subCategoryRouter.use("/:subCategoryId/brand",brandRouter);

subCategoryRouter.post("/addsubcategory/:categoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.createSubCategoryValidation),
    asyncHandler(subCategoryController.createSubCategory));

subCategoryRouter.patch("/updatesubcategory/:subCategoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.updateSubCategoryValidation),
    asyncHandler(subCategoryController.updateSubCategory));


//work as the next one but uses mergeParams
//has no test in postman
subCategoryRouter.get("/getsubcategory/:subCategoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.getSubCategoryValidation),
    asyncHandler(subCategoryController.getSubCategory));

subCategoryRouter.get("/:subCategoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.getSubCategoryValidation),
    asyncHandler(subCategoryController.getSubCategory));


subCategoryRouter.get("/getsubcateswithbrands",asyncHandler(subCategoryController.getAllSubCategoriesAndBrands));

subCategoryRouter.delete("/deletesubcategory/:subCategoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.deleteSubCategoryValidation),
    asyncHandler(subCategoryController.deleteSubCategory));


export default subCategoryRouter;
