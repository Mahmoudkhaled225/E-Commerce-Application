import {Schema,model} from "mongoose";

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
            name: {
                type: String,
                required: true
            },
            productPrice: {
                type: Number,
                required: true
            },
            finalPrice: {
                type: Number,
                required: true
            },
            _id: false
        }
    ],
    //more accurate address
    // address: {
    //     apartment: {type: String, required: true},
    //     building: {type: String, required: true},
    //     street: {type: String, required: true},
    //     city: {type: String, required: true},
    //     country: {type:String, default: 'egypt'}
    // },
    address: { type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    subTotal: {
        type: Number,
        required: true,
        default: 1
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
    },
    totalPrice: {
        type: Number, default: 1
    },
    paymentMethod: {
        type: String,
        default: "cash",
        enum: ['cash', 'card']
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'placed', 'on way', 'delivered', 'cancelled', 'rejected']
    },
    reason: String,
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})


const orderModel = model.Order || model('Order', orderSchema);

export default orderModel;

