const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const User = require("../models/user.js");
const passport = require("passport");
const Booking = require("../models/booking.js");
const flash = require("connect-flash");
const { UniqueUrl, saveUrl, validateRegister, validateUpdateUser, Re_ValidateEmail, showUrl } = require("../AuthenticLogin.js");
const placeList = require("../models/wonderLust.js");
const wrapAsync = require("../utils/wrapAsync.js");

const multer = require("multer");
const { storage } = require("../cloudConfigure.js");
const upload = multer({ storage });

// User Details Route
router.get("/userDetails/:id", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/listings");
    }

    const { id } = req.params;
    const user = await User.findById(id);
    const userBooking = await Booking.find({ owner: id }).populate({ path: "places_list", populate: { path: "owner" } });

    console.log(userBooking);
    return res.render("./signup/userDetails.ejs", { user, userBooking });
}));

// Update User
router.post("/updateUser/:id/edit", upload.single("userData[image]"), validateUpdateUser, wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/listings");
    }

    const { id } = req.params;
    console.log("Updating user:", id);

    let data = await User.findByIdAndUpdate(id, { ...req.body.userData });
    if (req.file) {
        let { path: url, filename } = req.file;
        data.image = { url, filename };
        await data.save();
        console.log("Updated user data:", data);
    }

    req.flash("success", "Your personal details were updated successfully!");
    return res.redirect(`/userDetails/${id}`);
}));

// Signup Route
router.get("/signup", wrapAsync((req, res) => {
    console.log("Rendering signup page");
    return res.render("./signup/signup.ejs");
}));

router.post("/signup", validateRegister, wrapAsync(async (req, res) => {
    try {
        console.log("Signup request received:", req.body);

        // Store user data in session for OTP validation
        req.session.email = req.body.email;
        req.session.username = req.body.username;
        req.session.password = req.body.password;

        console.log("Session data saved:", req.session);

        return res.redirect("/validateotp");
    } catch (error) {
        console.error("Error in signup route:", error);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/signup");
    }
}));

// OTP Validation Route
router.get("/validateotp", wrapAsync((req, res) => {
    return res.render("./signup/otp.ejs");
}));

router.post("/validateotp", wrapAsync(async (req, res) => {
    let { email, username, password, otp: sessionOtp } = req.session;
    let otp = req.body.otp.join("");

    if (otp === sessionOtp) {
        const newUser = new User({ email, username });
        const regUser = await User.register(newUser, password);

        req.login(regUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to SafarSathi!");
            return res.redirect("/listings");
        });
    } else {
        req.flash("error", "Incorrect OTP.");
        return res.redirect("/signup");
    }
}));

// Login Route
router.get("/login", wrapAsync((req, res) => {
    return res.render("./signup/login.ejs");
}));

router.post(
    "/login",
    saveUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    wrapAsync((req, res) => {
        const redirectUrl = res.locals.redirectUrl || res.locals.redirectUrlUnique || "/listings";
        req.flash("success", "Welcome back to SafarSathi!");
        return res.redirect(redirectUrl);
    })
);

// Logout Route
router.get("/logout", (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) return next(err);

            req.flash("success", "You have logged out.");
            return res.redirect("/listings");
        });
    } else {
        req.flash("error", "You are not logged in.");
        return res.redirect("/login");
    }
});

// Forgot Password Route
router.get("/forgotPassword", wrapAsync((req, res) => {
    return res.render("./signup/forgotEmail.ejs");
}));

router.post("/forgotPasswordOtp", wrapAsync(async (req, res) => {
    let { Re_email, passwordName, password, Cpassword } = req.body;

    req.session.Re_email = Re_email;
    req.session.passwordName = passwordName;
    req.session.password = password;
    req.session.Cpassword = Cpassword;

    let listingUser = await User.findOne({ username: passwordName });
    console.log("Found user:", listingUser);

    if (!listingUser) {
        req.flash("error", "Account not found!");
        console.log("ERROR - Account not found");
        return res.redirect("/forgotPassword");
    }

    if (password !== Cpassword) {
        req.flash("error", "Passwords do not match!");
        return res.redirect("/forgotPassword");
    }

    return res.redirect("/validatePasswordOtp");
}));

router.get("/validatePasswordOtp", Re_ValidateEmail, (req, res) => {
    return res.render("signup/passwordOtp.ejs");
});

router.post("/validatePasswordOtp", wrapAsync(async (req, res) => {
    let { passwordName, Cpassword } = req.session;

    let listingUser = await User.findOne({ username: passwordName });
    if (!listingUser) {
        req.flash("error", "Account not found!");
        return res.redirect("/forgotPassword");
    }

    await listingUser.setPassword(Cpassword);
    await listingUser.save();

    req.flash("success", "Successfully updated password!");
    return res.redirect("/login");
}));

module.exports = router;