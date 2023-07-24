import userModel from "../../DB/models/userModel.js";
import AppError from "../../utils/ErrorHandling/AppError.js";
import {createToken} from "../../utils/token/createToken.js";
import {decodedToken} from "../../utils/token/decodedToken.js";
import sendEmail from "../../services/sendMail.js";
import {hashPassword} from "../../utils/hashing/hashPassword.js";
import {compareHashedPassword} from "../../utils/hashing/compareHashedPassword.js";
import cloudinary from "../../services/cloudinary.js";
import slugify from "slugify";
import {alter} from "../../utils/token/alter.js";
import {nanoid} from "nanoid";


/**
 * @desc      user register
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   POST /ecommerce/v1/auth/signup
 * @access  Public

 */
export const signUp = async (req, res,next) => {
    const {email} = req.body;
    const customId = nanoid(5);
    (await userModel.findOne({email})) && next(new AppError("email already exist so login", 400));
    const hashedPassword = hashPassword(req.body.password);
    const user = new userModel({
        name:req.body.name,
        email,
        slug:slugify(req.body.name, { lower: true }),
        customId,
        password:hashedPassword,
        phone:req.body.phone,
        age:req.body.age,
        // image:{path:req.file.path/*,publicId:public_id*/}
        });
    const token = createToken({user});
    const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/auth/confirmEmail/${token}`;
    await sendEmail({
        to: user.email,
        message: `<a href=${confirmationLink}>Click to confirm</a>`,
        subject: "Confirmation Password"
    });
    if(!sendEmail)
        return next(new AppError("sign up fail we could not send the email for you so try again", 400));

    return res.status(200).json({message: "check your inbox and click link to activate "})
};

/**
 * @desc      confirm mail to finish user registration
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   GET /ecommerce/v1/auth/confirmEmail/:token

 */
export const confirmEmail = async (req, res, next) => {
    const {token} = req.params;
    const decode = decodedToken(token, process.env.TOKEN_SIGNATURE);
    (!decode?.user) && next(new AppError("in-valid decoding token", 400));
    decode.user.confirmed = true;
    (await userModel.findById({_id:decode.user._id})) && next(new AppError("you are already confirmed", 400));
    const savedUser = await userModel.create({...decode.user});
    (!savedUser) && next(new AppError("fail during confirmation please try again", 400));
    return res.status(201).json({message: "you are confirmed now you can login",savedUser,token});
};


export const addProfileImg = async (req, res, next) => {
    const {token} = req.params;
    const decode = decodedToken(token, process.env.TOKEN_SIGNATURE);
    if(!decode?.user)
        return next(new AppError("in-valid decoding token", 400));
    const user = await userModel.findById({_id: decode.user._id, confirmed: true});
    if (!user)
        return next(new AppError("you are not registered to upload img sign up plz", 400));
    if (user.image.publicId && user.image.path)
        return next(new AppError("you are already have img", 400));
    if (!req.file)
        return next(new AppError("Please upload a your image"), 400);
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,
        {
            folder: `${process.env.PROJECT_FOLDER}/Users/${user.customId}`
        });
    user.image = {path: secure_url, publicId: public_id};
    await user.updateOne({$set: {image: {path: secure_url, publicId: public_id}}});
    alter(token);

    return res.status(201).json({message: "you img has been added you can login if you want",user});
};

/**
 * @desc      user login
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   POST /ecommerce/v1/auth/login
 * @access  Private Users and Admins

 */
export const logIn = async (req, res, next) => {
    const{email,password} = req.body;
    const user = await userModel.findOne({email,confirmed:true});
    (!user) && next(new AppError("in-valid data1", 400));
    (user.isDeleted===true) && next(new AppError("you are soft delted try to undo soft delete", 400))
    const isPasswordValid = compareHashedPassword(password,user.password);
    (!isPasswordValid) && next(new AppError("in-valid data2", 400));
    const token = createToken({id: user._id})
    res.json({ message: "login success", user ,token});
};

//for first time here he signed up and did not add it
export const addProfileImgWhileLogIn = async (req, res, next) => {
    const {_id} = req.user;
    if(!req.file)
        return next(new AppError("please select you pictures", 404));
    const user = await userModel.findOne({_id,confirmed:true});
    if(!user)
        return next(new AppError("you are not signed up register plz", 400));
    if(user.image.publicId && user.image.path)
        return next(new AppError("you are already have img", 400));
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,
        {folder:`${process.env.PROJECT_FOLDER}/users/${user.customId}`,});
    await user.updateOne({$set:{image:{path:secure_url,publicId:public_id}}});
    return res.status(200).json({ message: "Done" ,user});
};




/**
 * @desc      update profile Img
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/login
 * @access  Private Users and Admins

 */
export const changeProfilePicture = async (req, res, next) => {
    if(!req.file)
        return next(new AppError("please select you pictures", 404));
    const { _id } = req.user;
    const user = await userModel.findById(_id);
    if(!user)
        return next(new AppError("please log in to update your pic", 404));
    if(user) {
        await cloudinary.uploader.destroy(user.image.publicId);
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,
            {folder:`${process.env.PROJECT_FOLDER}/users/${user.customId}`,});
        await user.updateOne({$set:{image:{path:secure_url,publicId:public_id}}});
    }
    return res.status(200).json({ message: "Done" ,user});
};

/**
 * @desc      send code on mail to forget password
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   GET /ecommerce/v1/auth/forgetpasscode/:email
 * @access  Public

 */
export const sendCodeToForgetPassword = async (req, res, next) => {
    const {email} = req.params;
    const user = await userModel.findOne({email, confirmed: true});
    if(!user)
        return next(new AppError("in-valid email", 400));
    const code = nanoid(6, "123456789");
    await sendEmail({
        to: user.email,
        message:`<h1>your code is ${code}</h1`,
        subject: "Forget Password"
    });
    if(!sendEmail)
        return next(new AppError("could not send you mail plz try again", 400));
    //console.log(user);
    await user.updateOne({forgetPasswordCode:code})
    return res.status(200).json({message: "check your inbox "})
};

/**
 * @desc      actual Forget Password Logic and update
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/resetpassword/:email
 * @access  Private Users and Admins

 */
export const actualForgetPasswordLogic = async (req, res, next) => {
    const {email} = req.params;
    const {forgetPasswordCode, newPassword , newConfirmationPassword} = req.body
    const user = await userModel.findOne({email,  forgetPasswordCode});
    if(!user)
        return next(new AppError("you are not signed up register plz", 400));
    if(user.forgetPasswordCode !== forgetPasswordCode)
        return next(new AppError("in-valid code", 400));

    await user.updateOne(
        {$set:{
            forgetPasswordCode:null,
            password:hashPassword(newPassword)},
        })

    return res.status(200).json({ message: "you pass is changed please login", user});

};

/**
 * @desc      change user password == update user password
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/updatepassword
 * @access  Private Users and Admins

 */
// alter change token so that if he decoded it he will not be able to use it again
// so he has to log in again to get new token

export const updatePassword = async (req, res,next) => {
    const {currentPassword ,newPassword,newConfirmationPassword} = req.body;
    const {token} = req.headers;
    const decoded = decodedToken(token);
    const checkUser = await userModel.findOne({_id:decoded.id,confirmed:true});
    if(!compareHashedPassword(currentPassword,checkUser.password))
        return next(new AppError("in-valid current password", 400));
    if(newPassword !== newConfirmationPassword)
        return next(new AppError("new password and new confirmation password are not same", 400));
    const hashedPassword = hashPassword(newPassword);
    const flag = await checkUser.updateOne({password:hashedPassword});
    if(flag.modifiedCount===0)
        return next(new AppError("could not update password please try again", 400));
    return res.json({ message: "password changed log in again", checkUser });
};

/**
 * @desc      delete user from database
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   DELETE /ecommerce/v1/auth/delete
 * @access  Private Users and Admins

 */
export const deleteUser = async (req, res, next) => {
    const { _id } = req.user;
    const user = await userModel.findByIdAndDelete(_id);
    (user)&& await cloudinary.uploader.destroy(user.image.publicId)&& res.json({ message: "you are deleted Done" });
    res.json({ message: "fail" });
};

/**
 * @desc      deactivate user account but it still in database
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   DELETE /ecommerce/v1/auth/softdelete
 * @access  Private Users and Admins

 */
export const softDeleteUser = async (req, res,next) => {
    const { _id } = req.user;
    const user = await userModel.findByIdAndUpdate(_id, {isDeleted: true});
    (user)&& res.json({ message: "Done" });
    res.json({ message: "fail" });
};

/**
 * @desc      send mail for undo soft delete
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/mailundosoftdelete/:email
 * @access  Private Admins and Users
 *
 */
export const undoSoftDeleteSendMail = async (req, res, next) => {
    const {email} = req.params;
    const user = await userModel.findOne({email, isDeleted: true});
    if(!user)
        return next(new AppError("in-valid email", 400));
    if(user.confirmed === true && user.isDeleted === false)
        return next(new AppError("you are already confirmed", 400));
    const code = nanoid( 6, "123456789");
    const message = `this is your code ${code} to undo soft delete`;
    await sendEmail({
        to: user.email,
        message,
        subject: "Undo Soft Delete"
    });
    if(!sendEmail)
        return next(new AppError("could not send you mail plz try again", 400));
    await user.updateOne({$set:{undoIsDeletedCode:code}})
    return res.status(200).json({message: "check your inbox"});
};

/**
 * @desc      actual undo soft delete
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/undosoftdelete/:email
 * @access  Private Admins and Users
 *
 */
export const undoSoftDelete = async (req, res, next) => {
    const {email} = req.params;
    const { undoIsDeletedCode } = req.body;
    const user = await userModel.findOne({email, undoIsDeletedCode});
    (!user) && next(new AppError("you are not signed up register plz", 400));
    (user.undoIsDeletedCode !== undoIsDeletedCode) && next(new AppError("in-valid code", 400));
    await user.updateOne({$set:{undoIsDeletedCode:null, isDeleted:false}});
    return res.status(200).json({ message: "welcome please login", user});
};

/**
 * @desc      update user profile name and phone and age or all or part of them
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @param     { Callback } next - to be called after this middleware function
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   PATCH /ecommerce/v1/auth/updateprofile
 * @access  Private Users and Admins
 *
 */
export const updateProfile = async (req, res, next) => {
    const {_id} = req.user;
    const obj = {...req.body};
    if (req.body.name)
        obj.slug= slugify(req.body.name, { lower: true });
    const user = await userModel.findByIdAndUpdate(_id,
        {...obj},
        { new: true });
    if(!user)
        return next(new AppError("you are not signed up register plz", 400));
    res.json({ message: "profile updated", user });
};

/**
 * @desc      logOut
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @returns   { JSON } - A JSON object representing the type, message
 * @route   GET /ecommerce/v1/auth/logout
 * @access  Private Users and Admins
 *
 */
// alter change token so that if he decoded it he will not be able to use it again
// so he has to log in again to get new token
export const logOut = async (req, res) => {
    let { token } = req.headers;
    const decoded = decodedToken(token, process.env.TOKEN_SIGNATURE);
    (!decoded||!decoded.id)&& res.json({ message: "decoded fail" });
    req.headers.token = alter(token);
    res.status(200).json({msg:"you logged out and our token is changed"});
};