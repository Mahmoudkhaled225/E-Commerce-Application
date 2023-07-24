import {Schema,model} from "mongoose";

const brandSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Brand required'],
        minlength: [1, 'Too short Brand name it should be at least 1 character'],
        maxlength: [32, 'Too long Brand name it should be at most 32 character'],
        unique:false,
    },
    slug: {
        type: String,
        required: [true, 'Slug required'],
        unique: true,
        lowercase: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User required'],
    },
    image: {
        path: {
            type: String,
            required: [true, 'Image path required'],
        },
        publicId: {
            type: String,
            required: [true, 'Image publicId required'],
        }
    },
    customId: {
        type: String,
        required: [true, 'CustomId required'],
        unique: true,
    },
    subCategoryId:{
        type: Schema.Types.ObjectId,
        ref: "subCategory",
        required: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


const brandModel = model.Brand || model("Brand",brandSchema)

export default brandModel;