const express = require("express");
const morgan = require("morgan");
const compression = require("compression")
//const xss = require("xss-clean")
const hpp = require("hpp")
const cors = require("corsfg")
const mongoSanitize = require("express-mongo-sanitize")

const app = express();



// Routers
const appError = require("./utils/appError")
const err = require("./controllers/errorControllers")
const projectRoutes = require("./routers/projectRouters");


//app.use(morgan("dev"))

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors())
app.options('*', cors())

app.use(compression())
app.use(mongoSanitize());

// Data sanitization against XSS
//app.use(xss());

app.use(hpp({
  whitelist: ['status', 'slug', 'tech']  //allow duplicate in result
}))

app.use("/mr/project", projectRoutes);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server `, 404))
})

app.use(err)

module.exports = app
