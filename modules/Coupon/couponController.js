import moment from 'moment';
import AppError from "../../utils/ErrorHandling/AppError.js";
import couponModel from "../../DB/models/couponModel.js";
import userModel from "../../DB/models/userModel.js";



export const validationCoupon = (coupon, userId) => {
    let expired = false
    let matched = false
    let exceed = false
    // expired
    if (coupon.couponStatus == 'expired' || moment(coupon.toDate).isBefore(moment())) {
        expired = true
    }
    // user not assgined
    for (const assginedUser of coupon.userUsage) {
        if (assginedUser.userId.toString() == userId.toString()) {
            matched = true
            // user exceed maxUsage
            if (assginedUser.maxUsage <= assginedUser.usageCount) {
                exceed = true
            }
        }
    }
    // user cant use coupon if matched ===false
    return {expired, matched, exceed};
};

export const createCoupon = async (req,res,next) => {
    const { code, fromDate, toDate, amount, userUsage } = req.body
    if (amount > 100) {
        return next(new AppError("amount not valid (must be from 1 to 100)",400 ));
    }
    if (await couponModel.findOne({code})) {
        return next(new AppError("please enter different coupon code",400 ))
    }

    // we can here make check user in the arr more strict and
    // also check if the user is user cause admin need no coupon

    let userIds = [];
    for (const user of userUsage) {
        if (!userIds.includes(user.userId)) {
            userIds.push(user.userId)
        }
    }

    const users = await userModel.find({ _id: { $in: userIds } })
    if (users.length !== userUsage.length) {
        return next(new AppError("in-valid userId",400))
    }
    const fromDateMoment = moment(new Date(fromDate)).format('YYYY-MM-DD HH:mm')
    const toDateMoment = moment(new Date(toDate)).format('YYYY-MM-DD HH:mm')

    if (
        moment(toDateMoment).isBefore(moment(fromDateMoment))) {
        return next(new AppError("please enter dates start from tomorrow",400))
    }

    const coupon = await couponModel.create({
        code,
        fromDate: fromDateMoment,
        toDate: toDateMoment,
        amount,
        createdBy: req.user._id,
        userUsage
    })
    if (!coupon) {
        return next(new AppError("please try to add coupon again", 400 ))
    }
    return res.status(201).json({ message: `Coupon Code ${code} added successfully` })
}


export const updateCoupon = async (req, res, next) => {
    // code , amount , toDate m fromDate
    const { couponId } = req.params;
    const coupon = await couponModel.findById(couponId);
    if (!coupon)
        return next(new AppError('in-valid coupon id',400));

    if (!Object.keys(req.body).length)
        return next(new Error('please enter the updated fields',400));


    // code
    if (req.body.code) {
        if (coupon.code == req.body.code)
            return next(new AppError('please enter a different code from the old one',400));

        if (await couponModel.findOne({ code: req.body.code }))
            return next(new Error('this coupon code is already exist',400));

        coupon.code = req.body.code;
    }
    // amount
    if (req.body.amount) {
        if (req.body.amount > 100 || req.body.amount < 1)
            return next(new AppError('please enter a valid amount',400));
        coupon.amount = req.body.amount;
    }

    // fromDate
    if (req.body.fromDate && !req.body.toDate) {
        const fromDateMoment = moment(new Date(req.body.fromDate))
        if (fromDateMoment.isBefore(moment())||
            fromDateMoment.isSame(moment(coupon.fromDate))||
            fromDateMoment.isAfter(coupon.toDate))
            return next(new AppError('please enter a valid dates',400));

        coupon.fromDate = fromDateMoment.format('YYYY-MM-DD HH:mm');
    }

    // toDate
    if (req.body.toDate && !req.body.fromDate) {
        const toDateMoment = moment(new Date(req.body.toDate));
        if (
            toDateMoment.isBefore(moment()) ||
            //avoid hh:mm
            toDateMoment.isSame(moment(moment(coupon.toDate).format('YYYY-MM-DD'))) ||
            toDateMoment.isBefore(coupon.fromDate)
        )
            return next(new AppError('please enter a valid dates',400));
        coupon.toDate = toDateMoment.format('YYYY-MM-DD HH:mm');
    }

    // toDate and fromDate
    if (req.body.toDate && req.body.fromDate) {
        const fromDateMoment = moment(new Date(req.body.fromDate));
        const toDateMoment = moment(new Date(req.body.toDate));
        const now = moment();

        if (fromDateMoment.isBefore(now) ||
            toDateMoment.isBefore(now) ||
            toDateMoment.isBefore(fromDateMoment))
            return next(new Error('please enter dates start from tomorrow',400));

        coupon.fromDate = fromDateMoment.format('YYYY-MM-DD HH:mm');
        coupon.toDate = toDateMoment.format('YYYY-MM-DD HH:mm');
    }

    coupon.updatedBy = req.user._id;
    const savedCoupon = await coupon.save();
    if (!savedCoupon)
        return next(new AppError('update coupon fail',400));
    res.status(200).json({ message: "Done", savedCoupon });
}


export const deleteCoupon = async (req, res, next) => {
    const {couponId} = req.params;
    const coupon = await couponModel.findByIdAndDelete(couponId);
    if(!coupon)
        return next(new AppError("coupon not found so you cant delete it ",404));
    else
        return res.json({message: "you are deleted Done"});

    return next(new AppError("error happend try again please ",404));
};

export const getAllCoupons = async (req, res, next) => {
    const coupon = await couponModel.find({}).
    populate([{path: 'createdBy', select: 'name'}, {path: 'updatedBy', select: 'name'}]);

    if(!coupon)
        return next(new AppError("there is no coupons ",404));
    else
        return res.json({message: "here all of then",coupon});

    return next(new AppError("error happened try again please ",404));
};