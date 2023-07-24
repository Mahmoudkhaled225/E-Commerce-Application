import {Schema,model} from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category required'],
        minlength: [1, 'Too short Category name it should be at least 1 character'],
        maxlength: [32, 'Too long Category name it should be at most 32 character'],
        unique:true,

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
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

// subCategories
categorySchema.virtual('SubCategories', {
    ref: 'subCategory',
    localField: '_id',
    foreignField: 'categoryId',
})


const categoryModel = model.Category || model("Category",categorySchema)

export default categoryModel;