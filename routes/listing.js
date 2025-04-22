const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const placeList = require("../models/wonderLust.js");
const validateUserData = require("../joiSchema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressErr = require("../utils/ExpressErr.js");
const passport = require("passport");

const multer = require("multer");
const { storage } = require("../cloudConfigure.js");
const upload = multer({ storage });

const { isLogined, listOwner, UniqueUrl, validateData, saveUrl, showUrl } = require("../AuthenticLogin.js");

// Test Route
router.get("/api/TestListings", wrapAsync(async (req, res) => {
    const place = [{
        title: "Cozy Beachfront Cottage",
        description: "Escape to this charming beachfront cottage for a relaxing getaway.",
        image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1552733407..." },
        price: 1500,
        location: "Malibu",
        country: "United States",
    }];

    let x = await placeList.insertMany(place);
    console.log(x);
    res.json(x); // Use res.json to send a proper response
}));

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    let allListing = await placeList.find({});
    console.log("Fetched Listings");
    return res.render("listings/index.ejs", { allListing }); // Ensure return to prevent extra execution
}));

// New Listing Form
router.get("/new", isLogined, (req, res) => {
    console.log(res.locals);
    return res.render("listings/newForm.ejs");
});

// Create Listing
router.post("/", isLogined, upload.single("Listing[image]"), validateData, wrapAsync(async (req, res) => {
    if (!req.body.Listing) {
        throw new ExpressErr(400, "Invalid Listing Data");
    }

    console.log("Headers:", req.headers);
    console.log("Method:", req.method);
    console.log("Body:", req.body);

    const { path: url, filename } = req.file;
    let placeLists = req.body.Listing;
    placeLists.owner = req.user._id;
    placeLists.image = { url, filename };

    await placeList.insertMany(placeLists);
    req.flash("success", "New Listing is Created!");

    return res.redirect("/listings");
}));

// Show Route
router.get("/:id", UniqueUrl, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let content = await placeList.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!content) {
        req.flash("error", "Content Not Found");
        return res.redirect("/listings");
    }

    return res.render("listings/show.ejs", { content });
}));

// Edit Route
router.get("/:id/edit", isLogined, saveUrl, listOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log("Listing ID:", id);

    let content = await placeList.findById(id);
    if (!content) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    return res.render("listings/edit.ejs", { content });
}));

// Update Route
router.put("/:id", isLogined, UniqueUrl, listOwner, upload.single("Listing[image]"), validateData, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await placeList.findByIdAndUpdate(id, { ...req.body.Listing });

    req.flash("success", "Edited Successfully");
    return res.redirect(req.originalUrl || "/listings");
}));

// Delete Route
router.delete("/:id", isLogined, listOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await placeList.findByIdAndDelete(id);

    req.flash("success", "Deleted Successfully");
    return res.redirect("/listings");
}));

module.exports = router;