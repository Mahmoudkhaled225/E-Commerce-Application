import {Router} from "express";
const brandRouter = Router({mergeParams: true});
import {validation} from "../../middleware/validation.js";
import * as brandController from "./brandController.js";
import * as validators from "./brandValidation.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import {fileUpload} from "../../services/multer.js";
import authorization from "../../middleware/authorization.js";
import authentication from "../../middleware/authentication.js";
import accessRoles from "../EndPoints.js";
import productRouter from "../Product/productRouter.js";

brandRouter.use("/:brandId/product",productRouter);

brandRouter.post("/addbrand/:subCategoryId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.addBrandValidation),
    asyncHandler(brandController.addBrand));

// with mergeParams categoryRouter between subCategoryRouter and brandRouter
brandRouter.post("/add",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.addBrandValidation),
    asyncHandler(brandController.addBrand));

brandRouter.patch("/updatebrand/:brandId",
    fileUpload({}).single("image"),
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.updateBrandValidation),
    asyncHandler(brandController.updateBrand));

brandRouter.delete("/deletebrand/:brandId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.deleteBrandValidation),
    asyncHandler(brandController.deleteBrand));

brandRouter.get("/getbrand/:brandId",
    // asyncHandler(authentication()),
    // authorization(accessRoles.admin),
    // validation(validators.getBrandValidation),
    asyncHandler(brandController.getBrand));



brandRouter.get("/all",
    // asyncHandler(authentication()),
    // authorization(accessRoles.admin),
    asyncHandler(brandController.getAllBrands));

export default brandRouter;