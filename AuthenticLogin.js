const placeList = require("./models/wonderLust.js");
const Review = require("./models/review.js");
let ExpressErr = require("./utils/ExpressErr.js");
const {validateUserData} = require("./joiSchema.js");
const {validateUserRating} = require("./joiSchema.js");


module.exports.validateRating = (req,res,next)=>{
    console.log("Joi schema");
    let {err} = validateUserRating.validate(req.body);//TODO ANOTHER WAY TO GET THE MULTIPLE DATA FROM FORM ...
    console.log(err);
    if(err!=undefined){
        let errMsg = err.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        throw new ExpressErr(404,errMsg);
    }
    return next();
}
module.exports.validateData = (req,res,next)=>{
    //console.log(req.body);
    //console.log("ERROR IS OCCURING");
    let err = validateUserData.validate(req.body);//TODO ANOTHER WAY TO GET THE MULTIPLE DATA FROM FORM ...
    console.log(err);
    if(err){
        let errMsg = err.details.map((el)=>el.message).join(",");
        throw new ExpressErr(500,errMsg); 
    }
    next();
}

module.exports.isLogined = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error", "!!---PLEASE---LOGIN---!!");
        console.log(req.session.redirectUrl); 
        return res.redirect("/login");
    }
    next();
};
module.exports.UniqueUrl = (req,res,next)=>{
    req.session.redirectUrlUnique = req.originalUrl;
    console.log(req.session.redirectUrlUnique)
    console.log(req.originalUrl);
    next(); 
}
module.exports.saveUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; 
        console.log(res.locals.redirectUrl);
    }
    if(!req.session.redirectUrl){
        res.locals.redirectUrlUnique = req.session.redirectUrlUnique;
    }
    next();
};

module.exports.listOwner = async(req,res,next) =>{
    let {id} = req.params;
    let content = await placeList.findById(id);
    if(content.owner._id.equals(res.locals.nowUser._id)){
        console.log("USER AUTHENTICATED SUCCESSFULLY");
        res.render("listings/edit.ejs",{content});
    }else{
        req.flash("error","You are not allowed to access!!!");
        res.redirect(`/listings/${id}`);
    }
    next();
}

// module.exports.reviewOwner = async(req,res,next) =>{
//     let {id} = req.params;
//     let content = await Review.findById(id);
//     if(!content.author._id.equals(res.locals.nowUser._id)){
//         console.log("USER AUTHENTICATED SUCCESSFULLY");
//         req.flash("error","You are not allowed to access!!!");
//         res.redirect(`/listings/${id}`);
//     }
//     next();
// }