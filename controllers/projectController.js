const catchAsync = require("express-async-handler")
const ApiError = require('../utils/appError')
const Project = require('../models/projectModel')
const multer = require("multer")
const cloudinary = require("../utils/cloud")
const sharp = require("sharp")

const multerStorage = multer.memoryStorage()

const upload = multer({
    storage: multerStorage,
})

exports.uploadPhoto = upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'techImage', maxCount: 15 },
])

exports.resizePhotoProject = catchAsync(async (req, res, next) => {
    //console.log("object");
    if (!req.files.projectImage && !req.files.techImage ) return next()
    //console.log("object");
    req.body.imageCover = `${req.files.projectImage[0].originalname}`


    // await sharp(req.files.projectImage[0].buffer)
    //     .toFormat('jpeg')
    //     .jpeg({ quality: 90 })
    //     .toFile(`upload/project/${req.body.imageCover}`)

    // const result1 = await cloudinary.uploader.upload(`upload/project/${req.body.imageCover}`, {
    //     public_id: `${Date.now()}_Cover`,
    //     crop: 'fill',
    // });

    // req.body.projectImage = result1.url

    const result = await uploadToCloudinary(req.files.projectImage[0].buffer, req.files.projectImage[0].originalname,`upload/project/${req.body.imageCover}`);
    req.body.projectImage = result.url
    
    // console.log(req.body);
    req.body.techImage = []
    if(req.body.html){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596761-Tech.png")
    }
    if(req.body.css){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596775-Tech.png")

    }
    if(req.body.js){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596794-Tech.png")

    }
    if(req.body.bootstrap){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596783-Tech.png")

    }
    if(req.body.tailwind){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596788-Tech.png")

    }
    if(req.body.react){
        req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1707425597/1707425596790-Tech.png")
    }
    // Check if req.body.techImage is an array or req.files
    // if (Array.isArray(req.body.techImage)) {
    //     console.log('techImage is an array')
    // } else if (typeof req.files.techImage === 'object') {
    //     console.log('techImage is req.files')
    // }
    // await Promise.all(
    //     req.body.techImage.map(async (file, i) => {

    //         const filename = `${file.originalname}`

    //         await sharp(file.buffer)
    //           //  .resize(64, 64) // Set the dimensions for the icon
    //           .jpeg({ quality: 90, chromaSubsampling: '4:4:4' }) // Save as PNG with a transparent background
    //            // .toBuffer(); // Get the image data as a buffer
    //             .toFile(`upload/techImage/${filename}`)

    //         const result = await cloudinary.uploader.upload(`upload/techImage/${filename}`, {
    //             public_id: `${Date.now()}-Tech`,
    //             crop: 'fill',
    //         });
    //             //console.log("object");
    //             //console.log(file);
    //          req.body.techImage.push()

    //     })
    //  )

    if (req.files.techImage) {
        const techImagePromises = req.files.techImage.map(async (file) => {
            const result = await uploadToCloudinary(file.buffer, file.originalname, `upload/techImage/${file.originalname}`);
            req.body.techImage.push(result.url);
        });

        await Promise.all(techImagePromises);
    }

    next()
})

const uploadToCloudinary = (buffer, filename, folderPath, options = {}) => {
    return new Promise((resolve, reject) => {
        options.folder = folderPath;
        options.public_id = filename;

        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
        uploadStream.end(buffer);
    });
};

exports.createOne = catchAsync(async (req, res, next) => {
    const doc = await Project.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.deleteOne = catchAsync(async (req, res, next) => {
    const id = req.params.id

    const doc = await Project.findById(id)

    if (!doc) {
        return next(new ApiError(`Can't find Project on this id`, 404));
    }

    await doc.deleteOne()


    res.status(201).json({
        status: "deleted success",
    })
})


exports.getOne = catchAsync(async (req, res, next) => {
    const id = req.params.id

    let doc = await Project.findById(id)

    if (!doc) {
        return next(new ApiError(`Can't find Project on this id`, 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            doc
        }
    })
})

exports.getAllProject = catchAsync(async (req, res, next) => {
    let obj = {}
    if (req.query.status) {
        obj = { status: req.query.status }
    } else if (req.query.tech) {
        obj = { tech: { $regex: req.query.tech, $options: 'i' } }
    } else if (req.query.slug) {
        obj = { slug: req.query.slug }
    }


    const result = await Project.find(obj)

    if (!result) {
        return next(new ApiError('no projects yet', 404));
    }

    res.status(200).json({
        status: 'success',
        length: result.length,
        data: {
            result
        }
    })

})

exports.updateOne = catchAsync(async (req, res, next) => {
    const result = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!result) {
        return next(new ApiError('no document found with that id', 404));
    }

    res.status(201).json({
        success: "success",
        data: {
            data: result
        }
    })
})