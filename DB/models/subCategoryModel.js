import {Schema,model} from "mongoose";

const subCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'SubCategory required'],
        minlength: [1, 'Too short SubCategory name it should be at least 1 character'],
        maxlength: [32, 'Too long SubCategory name it should be at most 32 character'],
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
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, 'Category required'],
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

// subCategories
subCategorySchema.virtual('Brands', {
    ref: 'Brand',
    localField: '_id',
    foreignField: 'subCategoryId',
})


const subCategoryModel = model.subCategory || model("subCategory",subCategorySchema)

export default subCategoryModel;