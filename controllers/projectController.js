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

    if (!req.files.projectImage && !req.files.techImage) return next()

    req.body.imageCover = `${req.files.projectImage[0].originalname}`


    await sharp(req.files.projectImage[0].buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`upload/project/${req.body.imageCover}`)

    const result1 = await cloudinary.uploader.upload(`upload/project/${req.body.imageCover}`, {
        public_id: `${Date.now()}_Cover`,
        crop: 'fill',
    });

   

    req.body.projectImage = result1.url

    req.body.techImage = []
    // req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1706971112/1706971111405-Tech.jpg")
    // req.body.techImage.push("http://res.cloudinary.com/dghznhvma/image/upload/v1706971112/1706971111392-Tech.jpg")
    // req.body.techImage.push("https://res.cloudinary.com/dghznhvma/image/upload/v1706973540/1706973539377-Tech.jpg")
    //req.body.techImage.push("https://res.cloudinary.com/dghznhvma/image/upload/v1706972651/1706972649769-Tech.jpg")
    //req.body.techImage.push("https://res.cloudinary.com/dghznhvma/image/upload/v1706972497/1706972496128-Tech.jpg")
    //req.body.techImage.push("https://res.cloudinary.com/dghznhvma/image/upload/v1706976446/1706976444956-Tech.jpg")

    await Promise.all(
        req.files.techImage.map(async (file, i) => {

            const filename = `${file.originalname}`

            await sharp(file.buffer)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`upload/techImage/${filename}`)

            const result = await cloudinary.uploader.upload(`upload/techImage/${filename}`, {
                public_id: `${Date.now()}-Tech`,
                crop: 'fill',
            });

            req.body.techImage.push(result.url)

        })
    )

    next()
})

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

    await doc.remove()


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
        obj = { tech:{ $regex: req.query.tech, $options: 'i' }}
    }else if (req.query.slug) {
        obj = { slug:req.query.slug}
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

exports.updateOne=catchAsync(async (req, res, next) => {
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