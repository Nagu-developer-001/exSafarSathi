const express = require("express");
const router = express.Router({mergeParams:true});
const mongoose = require("mongoose");
const User = require("../models/user.js");
const passport = require("passport");
const flash = require("connect-flash");
const { saveUrl ,validateRegister,validateUpdateUser,Re_ValidateEmail} = require("../AuthenticLogin.js");


const multer  = require('multer');
const {storage} = require("../cloudConfigure.js");
const upload = multer({ storage: storage });

router.get("/userDetails/:id",async(req,res)=>{
    let {id} = req.params;
    let user = await User.findById(id);
    res.render("./signup/userDetails.ejs",{user});
});
router.post("/updateUser/:id/edit",upload.single('userData[image]'),validateUpdateUser,async(req,res)=>{
    let id = req.params.id;
    console.log(id);
    let data = await User.findByIdAndUpdate(id,{...req.body.userData});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        data.image = {url,filename};
        await data.save();
        console.log(data);
    }
    await data.save();
    req.flash("success","Your Personal Details Edited Successfully!");
    console.log(id);
    res.redirect(`/userDetails/${id}`);
});

router.get("/forgotPasswordOtp");
router.get("/signup", (req, res) => {
    console.log("reder file for sign up");
    res.render("./signup/signup.ejs");
});

router.post("/signup", validateRegister, async (req, res) => {
    try {
        console.log("Signup request received:", req.body);

        // Store user data in session for OTP validation
        req.session.email = req.body.email;
        req.session.username = req.body.username;
        req.session.password = req.body.password;

        console.log("Session data saved:", req.session);

        res.redirect("/validateotp"); 
    } catch (error) {
        console.error("Error in signup route:", error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/signup");
    }
});
router.get("/validateotp",(req,res)=>{
    res.render("./signup/otp.ejs");
});
router.post("/validateotp",async(req,res)=>{
        let email = req.session.email;
        let username = req.session.username;
        let password = req.session.password;
        
        let otp = req.body;
        otp = otp.otp.join("");
        if(otp == req.session.otp){
            const newUser = new User({ email, username });
            const regUser = await User.register(newUser, password);
            console.log("sending email");
            req.login(regUser, (err) => {
                if (err) {
                    return next(err);
                }
                //requested url
                req.flash("success","Welcome to SafarSathi");
                res.redirect("/listings");
            });
        }else{
            req.flash("error","You Entered wrong OTP");
            res.redirect("/signup");
        }
});


router.get("/login", (req, res) => {
    res.render("./signup/login.ejs");
});

router.post(
    "/login",
    saveUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        const redirectUrl = res.locals.redirectUrl || res.locals.redirectUrlUnique || "listings";
        req.flash("success", "Welcome back to SafarSathi");
        return res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You logged out");
            res.redirect("/listings");
        });
    } else {
        req.flash("error", "You are not logged in");
        res.redirect("/login");
    }
});
router.get("/forgotPassword",(req,res)=>{
    res.render("./signup/forgotEmail.ejs");
});


























router.post("/forgotPasswordOtp",async(req,res)=>{
    let {Re_email,passwordName,password,Cpassword} = req.body;
    req.session.Re_email = Re_email;
    req.session.passwordName = passwordName;
    req.session.password = password;
    req.session.Cpassword = Cpassword;
    let listingUser = await User.findOne({username:passwordName});
    console.log(listingUser);
    if(!listingUser){
        req.flash("error","Account not found!!");
        console.log("ERROR-A/c not found");
        return res.redirect("/");
    }
    if(password!=Cpassword){
        req.flash("error","write the both password correctly!");
        return res.redirect("/forgotPassword");
    }
    res.redirect("/validatePasswordOtp");
});
router.get("/validatePasswordOtp",Re_ValidateEmail,(req,res)=>{
    res.render("signup/passwordOtp.ejs");
})
router.post("/validatePasswordOtp",async(req,res)=>{
    let Re_email = req.session.Re_email;
    let listingUser = await User.findOne({username:req.session.passwordName});
    await listingUser.setPassword(req.session.Cpassword);
    await listingUser.save();
    req.flash("success","Successfully Updated password!");
    res.redirect("/login");
});
module.exports = router;