const mongoose = require('mongoose')
const slugify = require('slugify');


const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Project must be required"],
        unique:[true,"Project must be unique"],
        minLength:[3,"Too Short Project Name"],
        maxLength:[32,"Too Long Project Name"]
    },
    slug:{
        type:String,
        unique:true,
        lowercase:true,
    },
    projectImage:{
        type:String,
        //required: [true, "a project must have image"]
    },
    linkProject:{
        type:String,
        required: [true, "a project must have link"]
    },
    linkProjectGH:{
        type:String,
       // required: [true, "a project must have github link"]
    },
    status:{
        type:String
    },
    tech:{
        type:String
    },
    techImage:[String],
    
},
{
    timestamps:true,
})

projectSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})


const projectModel = mongoose.model('Project',projectSchema); 

module.exports = projectModel