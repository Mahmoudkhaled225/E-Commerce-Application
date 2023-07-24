import {Router} from "express";
const cartRouter = Router();

import * as cartController from "./cartController.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import authentication from "../../middleware/authentication.js";
import accessRoles from "../EndPoints.js";
import authorization from "../../middleware/authorization.js";

cartRouter.post("/addtocart",
    asyncHandler(authentication()),
    authorization(accessRoles.user),
    asyncHandler(cartController.addToCart));

cartRouter.delete("/removeproductfromcart",
    asyncHandler(authentication()),
    authorization(accessRoles.user),
    asyncHandler(cartController.removeProductFromCart));




cartRouter.get("/getcart",
    asyncHandler(authentication()),
    authorization(accessRoles.user),
    asyncHandler(cartController.getCart));


export default cartRouter;
