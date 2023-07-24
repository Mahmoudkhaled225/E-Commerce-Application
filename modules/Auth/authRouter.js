import {Router} from "express";
import * as authController from "./authController.js";
import {fileUpload} from "../../services/multer.js";
import asyncHandler from "../../utils/ErrorHandling/asyncHandler.js";
import {validation} from "../../middleware/validation.js";
import * as validators from "./authValidation.js";
import authorization from "../../middleware/authorization.js";
import authentication from "../../middleware/authentication.js";
import accessRoles from "../EndPoints.js";


const authRouter = Router();


//asyncAPIS calls
authRouter.post("/signup",
    //fileUpload({}).single("image"),
    validation(validators.signUpValidation),
    asyncHandler(authController.signUp));

authRouter.get("/confirmEmail/:token",
    validation(validators.confirmEmailValidation),
    asyncHandler(authController.confirmEmail));

authRouter.patch("/addprofileimg/:token",
    fileUpload({}).single("image"),
    validation(validators.addProfileImgValidation),
    asyncHandler(authController.addProfileImg));


authRouter.post("/login",
    validation(validators.loginValidation),
    asyncHandler(authController.logIn));




authRouter.patch(
    "/firsttimeaddprofileimgwhilelogin",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.addProfileImgWhileLogInValidation),
    asyncHandler(authController.addProfileImgWhileLogIn));


authRouter.patch(
    "/updateimg",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    fileUpload({}).single("image"),
    validation(validators.updateProfileImgValidation),
    asyncHandler(authController.changeProfilePicture));


authRouter.get("/forgetpasscode/:email",
    validation(validators.sendCodeToForgetPasswordValidation),
    asyncHandler(authController.sendCodeToForgetPassword));

authRouter.patch("/resetpassword/:email",
    validation(validators.actualForgetPasswordLogicValidation),
    asyncHandler(authController.actualForgetPasswordLogic));


authRouter.patch("/updatepassword",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    validation(validators.updatePasswordValidation),
    asyncHandler(authController.updatePassword));

//dont need validation
authRouter.delete("/delete",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    asyncHandler(authController.deleteUser));


//dont need validation
authRouter.delete("/softdelete",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    asyncHandler(authController.softDeleteUser));


authRouter.get("/mailundosoftdelete/:email",
    validation(validators.undoSoftDeleteSendMailvaldiation),
    asyncHandler(authController.undoSoftDeleteSendMail));

authRouter.patch("/undosoftdelete/:email",
    validation(validators.undoSoftDeletevaldiation),
    asyncHandler(authController.undoSoftDelete));


authRouter.patch("/updateprofile",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    validation(validators.updateProfileValidation),
    asyncHandler(authController.updateProfile));


authRouter.get("/logout",
    asyncHandler(authentication()),
    authorization(accessRoles.user, accessRoles.admin),
    asyncHandler(authController.logOut));


export default authRouter;


