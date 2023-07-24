import cartModel from "../../DB/models/cartModel.js";
import productModel from "../../DB/models/productModel.js";
import couponModel from "../../DB/models/couponModel.js";
import orderModel from "../../DB/models/orderModel.js";
import AppError from "../../utils/ErrorHandling/AppError.js";
import {validationCoupon} from "../Coupon/couponController.js";
import createCheckoutSession from "../../services/payment.js";
import Stripe from "stripe";
/*
flow
* Note if i removed products from the body in postman will check
* if there is cart if yes does it has
* will create order with it if not error empty cart
*/
export const createOrder = async (req, res, next) => {
    const userId = req.user._id;
    let session;
    const { products, couponCode, address, phone, paymentMethod } = req.body;
    // coupon validation
    if (couponCode) {
        const coupon = await couponModel.findOne({ code: couponCode });
        if (!coupon) {
            return next(new AppError('in-valid coupon code',400));
        }
        const { matched, exceed, expired } = validationCoupon(coupon, userId);

        if (expired) {
            return next(new AppError('this coupon is expired',400));
        }
        if (!matched) {
            return next(new AppError('this coupon is not assigned to you', 400));
        }
        if (exceed) {
            return next(new AppError('you exceed the max usage of this coupon',400));
        }
        req.body.coupon = coupon;
    }

    // is order coming from cart?
    if (!products?.length) {
        const cartExist = await cartModel.findOne({ userId });
        if (!cartExist?.products?.length) {
            return next(new AppError('empty cart',400));
        }
        req.body.isCart = true;
        req.body.products = cartExist.products;
    }
    // products validation
    // [{ productId , quantity}]
    let subTotal = 0;
    let finalProducts = [];
    let productIds = [];
    for (let product of req.body.products) {
        productIds.push(product.productId);
        const findProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
            isDeleted: false
        });
        if (!findProduct) {
            return next(new AppError('invalid product',400));
        }
        if (req.body.isCart) {
            product = product.toObject();
        }
        product.name = findProduct.name;
        product.productPrice = findProduct.priceAfterDiscount;
        product.finalPrice = Number.parseFloat(findProduct.priceAfterDiscount * product.quantity).toFixed(2);
        finalProducts.push(product);
        subTotal += parseInt(product.finalPrice);
    }

    paymentMethod === "cash" ? req.body.orderStatus = "placed" : req.body.orderStatus = "pending";

    const orderObject = {
        userId,
        products: finalProducts,
        address,
        phone,
        paymentMethod,
        orderStatus: req.body.orderStatus,
        subTotal,
        couponId: req.body.coupon?._id,
        totalPrice: Number.parseFloat(subTotal * (1 - ((req.body.coupon?.amount || 0) / 100))).toFixed(2)
    }

    const order = await orderModel.create(orderObject);
    if (order) {
        //usageCount +=1
        if (req.body.coupon) {
            for (const user of req.body.coupon?.usagePerUser) {
                if (user.userId.toString() === userId.toString()) {
                    user.usageCount += 1;
                }
            }
            await req.body.coupon.save();
        }
        // decrement stock -= quantity
        for (const product of req.body.products) {
            await productModel.findByIdAndUpdate(product.productId, {
                $inc: { stock: - parseInt(product.quantity) }
            });
        }
        // remove product from cart
        await cartModel.updateOne({ userId }, {
            $pull: { products: { productId: { $in: productIds } } }
        });
        // payment
        if (order.paymentMethod === 'card') {
            if (req.body.coupon) {
                const stripe = new Stripe(process.env.STRIPE_SERCET_KEY)
                const coupon = await stripe.coupons.create({
                    percent_off: req.body.coupon.amount,
                })
                req.body.couponId = coupon.id
            }

            session = await createCheckoutSession({
                //paymentMethodTypes: ['card'],
                //mode: 'payment',
                customerEmail: req.user.email,
                metadata: { orderId: order._id.toString() },
                cancelUrl: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
                successUrl:`${process.env.SUCCESS_URL}?orderId=${order._id.toString()}`,
                discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : [],
                lineItems: order.products.map(product => {
                    return {
                        price_data: {
                            currency: 'egp',
                            product_data: {
                                name: product.name,
                            },
                            unit_amount: product.productPrice * 100,
                        },
                        quantity: product.quantity,
                    }
                })
            })
        }
    }

    res.status(201).json({ message: "Done", order ,session})
}


export const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await orderModel.findById(orderId);
    if ((order?.orderStatus !== 'placed' && order?.paymentMethod === 'cash') ||
        (!['confirmed', 'pending'].includes(order?.orderStatus) && order?.paymentMethod === 'card')) {
        return next(new AppError(`you can not cancel this order with status ${order.orderStatus}`,400));
    }
    order.orderStatus = 'cancelled';
    order.reason = reason;
    order.upadtedBy = req.user._id;
    const orderCancelled = await order.save();
    if (orderCancelled) {
        if (order.couponId) {
            const coupon = await couponModel.findById(order.couponId)
            for (const user of coupon?.userUsage) {
                if (user.userId.toString() === order.userId.toString()) {
                    user.usageCount -= 1;
                }
            }
            await coupon.save();
        }
        // decrement stock => quantity
        for (const product of order.products) {
            await productModel.findByIdAndUpdate(product.productId, {
                $inc: { stock: parseInt(product.quantity) }
            });
        }
        res.status(200).json({ message: "order cancelled successfully" });
    }
}
