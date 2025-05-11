const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const placeList = require("../models/wonderLust.js");
const ExpressErr = require("../utils/ExpressErr.js");
const passport = require("passport");

const multer = require("multer");
const { storage } = require("../cloudConfigure.js");
const upload = multer({ storage });

const { isLogined, listOwner, UniqueUrl, validateData, saveUrl, showUrl } = require("../AuthenticLogin.js");

// Test Route
router.get("/api/TestListings", async (req, res, next) => {
    try {
        const place = [{
            title: "Cozy Beachfront Cottage",
            description: "Escape to this charming beachfront cottage for a relaxing getaway.",
            image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1552733407..." },
            price: 1500,
            location: "Malibu",
            country: "United States",
        }];

        let x = await placeList.insertMany(place);
        console.log("Inserted Test Listing:", x);
        return res.json(x);
    } catch (error) {
        next(error);
    }
});

// Index Route
router.get("/", async (req, res, next) => {
    try {
        let allListing = await placeList.find({});
        console.log("Fetched Listings:", allListing);
        return res.render("listings/index.ejs", { allListing });
    } catch (error) {
        next(error);
    }
});

// New Listing Form
router.get("/new", isLogined, (req, res) => {
    console.log("User Data:", res.locals);
    return res.render("listings/newForm.ejs");
});

// Create Listing
router.post("/", isLogined, upload.single("Listing[image]"), validateData, async (req, res, next) => {
    try {
        if (!req.body.Listing) {
            throw new ExpressErr(400, "Invalid Listing Data");
        }

        console.log("Request Headers:", req.headers);
        console.log("Request Method:", req.method);
        console.log("Request Body:", req.body);

        if (!req.file) {
            req.flash("error", "Image Upload Failed!");
            return res.redirect("/new");
        }

        const { path: url, filename } = req.file;
        let placeLists = req.body.Listing;
        placeLists.owner = req.user._id;
        placeLists.image = { url, filename };

        await placeList.insertMany(placeLists);
        req.flash("success", "New Listing Created!");

        return res.redirect("/listings");
    } catch (error) {
        next(error);
    }
});

// Show Route
router.get("/:id", UniqueUrl, async (req, res, next) => {
    try {
        let { id } = req.params;
        let content = await placeList.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");

        if (!content) {
            req.flash("error", "Listing Not Found");
            return res.redirect("/listings");
        }

        return res.render("listings/show.ejs", { content });
    } catch (error) {
        next(error);
    }
});
router.get('/list/:category', async(req, res) => {
    const categori = req.params.category;
    //req.session.catFiler = categori;
    //console.log(category);
    let categories = {
        Trending:"Trending",
        rooms:"rooms",
        iconicCities:"iconicCities",
        Mountains:"Mountains",
        Castles:"Castles",
        Religion:"Religion",
        Camping:"Camping",
        Farms:"Farms",
        Arctic:"Arctic",
        Waterfall:"Waterfall"
    };
    if(categories[categori]){
        allListing = await placeList.find({category:categori});
        //console.log(allListing);
        res.render("listings/index.ejs",{allListing});
    }else{
        console.log("no data found");
        req.flash("error","no data found");
        res.redirect("/listings");
    }
    //console.log("category - ",categories[category]);
});
// Edit Route
router.get("/:id/edit", isLogined, saveUrl, listOwner, async (req, res, next) => {
    try {
        let { id } = req.params;
        console.log("Editing Listing:", id);

        let content = await placeList.findById(id);
        if (!content) {
            req.flash("error", "Listing does not exist!");
            return res.redirect("/listings");
        }

        return res.render("listings/edit.ejs", { content });
    } catch (error) {
        next(error);
    }
});

// Update Route
router.put("/:id", isLogined, UniqueUrl, listOwner, upload.single("Listing[image]"), validateData, async (req, res, next) => {
    try {
        let { id } = req.params;
        let updatedData = { ...req.body.Listing };

        if (req.file) {
            updatedData.image = { url: req.file.path, filename: req.file.filename };
        }

        await placeList.findByIdAndUpdate(id, updatedData);

        req.flash("success", "Listing Updated Successfully");
        return res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }
});

// Delete Route
router.delete("/:id", isLogined, listOwner, async (req, res, next) => {
    try {
        let { id } = req.params;
        await placeList.findByIdAndDelete(id);

        req.flash("success", "Listing Deleted Successfully");
        return res.redirect("/listings");
    } catch (error) {
        next(error);
    }
});

module.exports = router;