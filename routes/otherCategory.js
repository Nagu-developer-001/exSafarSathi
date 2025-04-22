const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const { UniqueUrl } = require("../AuthenticLogin.js");
const placeList = require("../models/wonderLust.js");
const { isLogined, listOwner } = require("../AuthenticLogin.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/booking/:id", isLogined, wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const bookingId = req.params.id;

    console.log(userId, bookingId);

    const user = await User.findById(userId);
    const places = await placeList.findById(bookingId).populate("owner");

    // Check if the user has already booked this accommodation
    let existingBooking = await Booking.findOne({ owner: userId, title: places.title });

    console.log("Existing Booking:", existingBooking);
    if (existingBooking) {
        req.flash("error", "You have already booked this accommodation.");
        return res.redirect(`/listings/${bookingId}`);
    }

    let newBooking = new Booking({
        bookingCount: 1,
        title: places.title,
        places_list: bookingId,
        owner: userId
    });

    await newBooking.save();

    // Mark user as booked
    user.hasBooked = true;
    await user.save();

    req.flash("success", "Thank you for your registration!");
    return res.redirect(`/listings/${bookingId}`);
}));

router.delete("/del/:id", isLogined, wrapAsync(async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        req.flash("success", "Successfully cancelled your booking order");
        return res.redirect(`/listings`);
    } catch (error) {
        res.status(500).send(error.message);
    }
}));

router.get("/FAQ", UniqueUrl, wrapAsync((req, res) => {
    return res.render("./listings/faq.ejs");
}));

router.get("/help", UniqueUrl, wrapAsync((req, res) => {
    return res.render("./listings/help.ejs");
}));

router.get("/search", wrapAsync(async (req, res) => {
    let { searchQuery } = req.query;

    if (!searchQuery) {
        req.flash("error", "Sorry, no matching listings found.");
        return res.redirect(`/listings`);
    }

    req.session.searchQuery = searchQuery;

    let allListing = await placeList.find({
        $or: [{ title: { $regex: searchQuery, $options: "i" } }]
    });

    console.log(`Searching for ${searchQuery}:`, allListing);

    if (!allListing.length) {
        req.flash("error", "Sorry, no matching listings found.");
        return res.redirect(`/listings`);
    }

    return res.render("listings/index.ejs", { allListing });
}));

module.exports = router;