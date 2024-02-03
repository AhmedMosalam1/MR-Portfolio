const express = require('express')
const router = express.Router()
const project = require("../controllers/projectController")


router.post('/',project.uploadPhoto,project.resizePhotoProject,project.createOne)

router.get('/',project.getAllProject)
router.get('/:id',project.getOne)

router.patch("/:id",project.uploadPhoto,project.resizePhotoProject,project.updateOne)

router.delete('/:id',project.deleteOne)



module.exports = router  
