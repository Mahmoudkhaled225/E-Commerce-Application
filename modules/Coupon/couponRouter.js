import {Router} from "express";
const couponRouter = Router();
import {validation} from "../../middleware/validation.js";
import * as validators from "./couponValidation.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import authorization from "../../middleware/authorization.js";
import authentication from "../../middleware/authentication.js";
import accessRoles from "../EndPoints.js";
import * as couponController from "./couponController.js";


couponRouter.post("/add",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.createCouponValidation),
    asyncHandler(couponController.createCoupon));


couponRouter.patch("/updatecoupon/:couponId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    validation(validators.updateCouponValidation),
    asyncHandler(couponController.updateCoupon));


couponRouter.delete("/deletecoupon/:couponId",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    asyncHandler(couponController.deleteCoupon));

couponRouter.get("/allcoupons",
    asyncHandler(authentication()),
    authorization(accessRoles.admin),
    asyncHandler(couponController.getAllCoupons));



export default couponRouter;