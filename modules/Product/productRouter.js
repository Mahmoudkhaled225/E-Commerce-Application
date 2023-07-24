import {Router} from "express";
const productRouter = Router({mergeParams: true});
import * as productController from "./productController.js";
import {validation} from "../../middleware/validation.js";
import * as validators from "./productValidation.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import {fileUpload} from "../../services/multer.js";
import authentication from "../../middleware/authentication.js";
import authorization from "../../middleware/authorization.js";
import accessRoles from "../EndPoints.js";


//productRouter.post("/addproduct/:brandId",

//with mergeParams cate then subcate then brand
productRouter.post("/addproduct",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).fields([{ name: 'image', maxCount: 1 }, { name: "subImgs", maxCount: 2 }]),
    validation(validators.addProductValidation),
    asyncHandler(productController.addProduct));

productRouter.patch("/updateproduct/:productId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    fileUpload({}).fields([{ name: 'image', maxCount: 1 }, { name: "subImgs", maxCount: 2 }]),
    // validation(validators.updateProductValidation),
    asyncHandler(productController.updateProduct));


productRouter.delete("/deleteproduct/:productId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    // validation(validators.deleteImgsValidation),
    asyncHandler(productController.deleteProduct));

productRouter.get("/getproduct/:productId",
    // asyncHandler(authentication()),
    // authorization(accessRoles.admin),
    // validation(validators.getProductValidation),
    asyncHandler(productController.getProduct));


export default productRouter;

