import cartModel from "../../DB/models/cartModel.js";
import productModel from "../../DB/models/productModel.js";
import AppError from "../../utils/ErrorHandling/AppError.js";


export const addToCart = async (req, res, next) => {
    const userId = req.user._id
    const { productId, quantity } = req.body
    // product
    const product = await productModel.findById(productId);
    if (!product) {
        return next(new AppError("product is not exist",401));
    }
    if (product.stock < quantity || product.isDeleted)
        return next(new AppError(`not available product quantity to add it to cart available quantity is ${product.stock} no more or it is soft deleted `,400 ));

    // userId
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        const savedCart = await cartModel.create({
            userId,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ messages: "Done", savedCart });
    }

    // update exist product
    let isProductExist = false;
    for (const product of cart.products) {
        // console.log(product.productId, quantity);
        const stock = await productModel.findById(product.productId);
        console.log(stock.stock, quantity,quantity <= stock.stock);
        if (product.productId.toString() === productId && quantity <= stock.stock) {
            product.quantity = quantity;
            isProductExist = true;
            break
        }
    }

    if (!isProductExist)
        cart.products.push({ productId, quantity });

    await cart.save();
    res.status(200).json({ message: "Done", cart });
};

export const removeProductFromCart = async (req, res, next) => {
    const userId = req.user._id
    const { productId, quantity } = req.body
    const cart = await cartModel.findOneAndUpdate({ userId }, { $pull: { products: { productId } } }, { new: true });
    if (!cart) {
        return next(new AppError("no cart found",401));
    }
    res.status(200).json({ message: "Done", cart });
};

export const getCart = async (req, res, next) => {
    const userId = req.user._id
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        return next(new AppError("this user has no cart ",401));
    }
    res.status(200).json({ message: "Done", cart });
};