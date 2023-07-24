import {Schema,model} from "mongoose";

const cartSchema = new Schema({
    userId: {
        type:Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            _id: false
        }
    ]
}, {
    timestamps: true
});


const cartModel = model.Cart || model("Cart",cartSchema)

export default cartModel;