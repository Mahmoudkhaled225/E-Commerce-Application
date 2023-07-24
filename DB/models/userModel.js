import mongoose, {Schema} from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'UserName required'],
        minlength: [2, 'Too short user name'],
        maxlength: [32, 'Too long user name'],
    },
    customId: {
        type: String,
        required: [true, 'CustomId required'],
    },
    slug: {
        type: String,
        required: [true, 'Slug required'],
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, 'email required'],
        unique: [true, 'email must be unique'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'password required'],
        minlength: [2, 'Too short password'],
    },
    age: {
        type: Number,
        min: [18, "minimum age is 18"],
        //required: true,
    },
    phone: {
        type: String,
        required: [true, 'phone required'],
        minlength: [11, 'Too short phone number'],
        maxlength: [11, 'Too long phone number'],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    undoIsDeletedCode: {
        type: String,
        default: null,
    },
    //just for email confrimatation
    confirmed: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        //required: true,
        default: 'user',
    },
    image: {
        path: {
            type: String,
            // required: [true, 'Image path required'],
        },
        publicId: {
            type: String,
            // required: [true, 'Image publicId required'],
        }
    },
    forgetPasswordCode: {
        type: String,
        default: null,
    },
    //COMMING SOON
    userWishListOfProduct: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, 'product required'],
    }],

}, {
    timestamps: true
})

const userModel = mongoose.models.User || mongoose.model("User",userSchema)
export default userModel