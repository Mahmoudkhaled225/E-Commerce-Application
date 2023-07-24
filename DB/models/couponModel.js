import {Schema,model} from "mongoose";

const couponSchema = new Schema({
    code: {
        type: String,
        required: [true, 'code required'],
        unique:true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User required'],
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    amount: {
        type: Number,
        required: [true, 'Amount required'],
        default: 1,
    },
    couponStatus: {
        type: String,
        required: true,
        enum: ['valid', 'expired'],
        default: 'valid',
    },
    fromDate: {
        type: String,
        required: [true, 'From date required'],
    },
    toDate: {
        type: String,
        required: [true, 'To date required'],
    },
    //arr of one big obj
    //that big one has 3 small objs
    userUsage: [{
        _id: false,
        userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            maxUsage: {
                type: Number,
                required: true
            },
            usageCount: {
                type: Number,
                default: 0
            }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },

});

couponSchema.virtual('Users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'createdBy',
})

couponSchema.virtual('Users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'updatedBy',
})
const couponModel = model.Coupon || model("Coupon",couponSchema)
export default couponModel;