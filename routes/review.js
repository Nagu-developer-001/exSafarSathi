const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const placeList = require("../models/wonderLust.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { validateRating, isLogined } = require("../AuthenticLogin.js");

// Posting Reviews
router.post("/listings/:id/reviews", isLogined, validateRating, wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Processing review for listing:", id);

        let listing = await placeList.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect(`/listings/${id}`);
        }

        let newReview = new Review(req.body.reviews);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "Review Added Successfully!");
        return res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error posting review:", error);
        req.flash("error", "Something went wrong while adding the review.");
        return res.redirect(`/listings/${req.params.id}`);
    }
}));

// Deleting Reviews
router.delete("/listings/:id/reviews/:reviewsId", wrapAsync(async (req, res) => {
    try {
        const { id, reviewsId } = req.params;
        console.log("Attempting to delete review:", reviewsId);

        await Review.findByIdAndDelete(reviewsId);
        await placeList.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });

        req.flash("success", "Review deleted successfully!");
        return res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Failed to delete review.");
        return res.redirect(`/listings/${id}`);
    }
}));

module.exports = router;