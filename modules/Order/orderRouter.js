import {Router} from "express";
const orderRouter = Router();

import * as orderContoller from "./orderController.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import authentication from "../../middleware/authentication.js";
import authorization from "../../middleware/authorization.js";
import accessRoles from "../EndPoints.js";
import {validation} from "../../middleware/validation.js";
import * as validators from "./orderValidation.js";


orderRouter.post("/",
    asyncHandler(authentication()),
    authorization(accessRoles.user),
    asyncHandler(orderContoller.createOrder));

orderRouter.patch('/:orderId',
    asyncHandler(authentication()),
    authorization(accessRoles.user),
    validation(validators.cancelOrder),
    asyncHandler(orderContoller.cancelOrder))


export default orderRouter;