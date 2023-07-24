import {Schema,model} from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product required'],
        minlength: [1, 'Too short Product name it should be at least 1 character'],
        maxlength: [32, 'Too long Product name it should be at most 32 character'],
    },
    slug: {
        type: String,
        required: [true, 'Slug required'],
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        //required: [true, 'Product\'s sdescription required'],
        minlength: [1, 'Too short Product it should be at least 1 character'],
        maxlength: [56, 'Too long Product it should be at most 56 character'],
    },
    stock: {
        type: Number,
        required: [true,"stock number is required"],
        default: 1
    },
    price: {
        type: Number,
        required: [true,"price of product is required"],
        default: 1
    },
    discount: {
        type: Number,
        default: 0
    },
    priceAfterDiscount: {
        type: Number,
        default: 0
    },
    // colors: [String],
    // size: [String],
    image: {
        path: {
            type: String,
            required: [true, 'Image path required'],
        },
        publicId: {
            type: String,
            required: [true, 'Image publicId required'],
        }
    },//or mainImage: { type: Object, required: true },
    subImgs: [{secure_url:String, publicId:String}], //or subImgaes: { type: [Object] },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User required'],
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, 'CategoryId required'],
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
        required: [true, 'subCategoryId required'],
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: [true, 'brandId required'],
    },
    customId: {
        type: String,
        required: [true, 'CustomId required'],
        unique: true,
    },
    // it is not like soft delete it is just mark that you cant buy now out of stock
    isDeleted: {
        type: Boolean,
        default: false
    },
    //COMMING SOON
    //if user want to buy product but is Deleted Ture
    //i want when i it become false to tell him that he can buy it right now
    userAddToWishList: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User required'],
    }],
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
})


const productModel = model.Product || model("Product",productSchema)

export default productModel;