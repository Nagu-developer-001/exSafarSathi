const placeList = require("./models/wonderLust.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
let ExpressErr = require("./utils/ExpressErr.js");
const {validateUserData} = require("./joiSchema.js");
const {validateUserRating} = require("./joiSchema.js");
const {validateUpdateUser} = require("./joiSchema.js");
const crypto = require('crypto');
const { cache } = require("joi");
module.exports.Re_ValidateEmail = async(req,res,next)=>{
    try{
    let passwordName = req.session.passwordName;
    let email=req.session.Re_email;
    registration_process = await User.findOne({username:passwordName});
    const send = require('gmail-send')({
        user: 'trivikramagroupofltd@gmail.com',//TODO - Trivikrama!1,Bhat987654321!-MAPBOX
        pass: 'szinrtyyqykbyzxu',
        to:   email,
        subject: 'No Replay Email.',
    });
    const otp = crypto.randomInt(100000, 999999).toString();
    req.session.otp = otp;
        send({
            html:`<p>Welcome to SufarSathi a tourist accomodation platform that simplifies accomodation booking throughout the journey</p><br><h4>Hope our journey would be ever lasting!!!.....OTP for registering your a/c${otp}</h4>`,
        }, async(error, result, fullResult) => {
            console.error(error);
                });
    } catch (e) {
        req.flash("failure", e.message);
        return res.redirect("/signup");        
    }
next();
}
module.exports.validateRegister = async(req,res,next)=>{
    try {
        console.log("sending");
            const { email, username, password } = req.body;
            req.session.email = email;
            req.session.username = username;
            req.session.password = password;
            registration_process = await User.findOne({username:username});
            if(registration_process===null){
                const send = require('gmail-send')({
                    user: 'trivikramagroupofltd@gmail.com',//TODO - Trivikrama!1,Bhat987654321!-MAPBOX
                    pass: 'szinrtyyqykbyzxu',
                    to:   email,
                    subject: 'No Replay Email.',
                });
                const otp = crypto.randomInt(100000, 999999).toString();
                req.session.otp = otp;
                    send({
                        html:`<p>Welcome to SufarSathi a tourist accomodation platform that simplifies accomodation booking throughout the journey</p><br><h4>Hope our journey would be ever lasting!!!.....OTP for registering your a/c${otp}</h4>`,
                    }, async(error, result, fullResult) => {
                        console.error(error);
                            });
                
            }else{
                req.flash("error", "Try with new username");
                return res.redirect("/signup");
            }
        } catch (e) {
            req.flash("failure", e.message);
            return res.redirect("/signup");        }
        next();
}
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
    console.log(req.body);
    console.log("ERROR IS OCCURING");
    console.log(req.body);
    let err = validateUserData.validate(req.body);//TODO ANOTHER WAY TO GET THE MULTIPLE DATA FROM FORM ...
    
    console.log(err,"hllo error");
    if(!err){
        let errMsg = err.details.map((el)=>el.message).join(",");
        console.log("error occuring");
        throw new ExpressErr(500,errMsg); 
    }
    console.log("hllo error")
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

module.exports.validateUpdateUser = (req,res,next) =>{
    if (req.isAuthenticated()) {
        let err = validateUpdateUser.validate(req.body);
        if(!err){
            let errMsg = err.details.map((el)=>el.message).join(",");
            console.log("error occuring");
            throw new ExpressErr(500,errMsg); 
        }
        console.log("hllo error")
        next();
    }
};


module.exports.listOwner = async(req,res,next) =>{
    let { id } = req.params;
    let listing= await placeList.findById(id);
    if(!listing.owner._id.equals(res.locals.nowUser._id)){
    req.flash("error","You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.reviewOwner = async(req,res,next) =>{
    let {id,reviewsId} = req.params;
    let review = await Review.findById(reviewsId);
    if(!review.author.equals(res.locals.nowUser._id)){
        console.log("USER AUTHENTICATED SUCCESSFULLY");
        req.flash("error","You did'nt created this review!!!");
        res.redirect(`/listings/${id}`);
    } else{
        next();
    }
}