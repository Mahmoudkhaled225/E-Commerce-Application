import multer from 'multer'

export const validationObject = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/JPG",
        "image/JPEG", "image/gif", "image/GIF", "image/webp",
        "image/WEBP", "image/jfif", "image/JFIF"]
};

export function fileUpload({ customValidation = validationObject.image } = {}) {
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb('In-valid file format', false)
    }
    const upload = multer({ fileFilter, storage })
    return upload
}