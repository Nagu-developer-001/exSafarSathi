const express = require("express");
const router = express.Router({mergeParams:true});
const mongoose = require("mongoose");
const placeList = require("../models/wonderLust.js");
const Review = require("../models/review.js");

const ExpressErr = require("../utils/ExpressErr.js");

const isvalid = (req,res,next)=>{
    console.log("requesting");
    next();
}

const wrapAsync = require("../utils/wrapAsync.js");
const {validateRating,isLogined} = require("../AuthenticLogin.js");

//TODO POSTING REVIEWS

router.post("/listings/:id/reviews",isLogined,validateRating,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    console.log("hi-1");
    let listing=await placeList.findById(id);
    console.log("hi-2");
    let newReview = new Review(req.body.reviews);
    console.log("hi-3");
    newReview.author = req.user._id;
    console.log("hi-4");
    listing.reviews.push(newReview);
    console.log("hi-5");
    await newReview.save();
    await listing.save();
    console.log("hi-6");
    req.flash("success","Review Added Successfully");
    console.log("hi-7");
    return res.redirect(`/listings/${id}`);

}));


//TODO DELETE REQUEST
router.delete("/listings/:id/reviews/:reviewsId",wrapAsync(async (req,res) => {
    // res.send("TRYING TO DELETE REVIEWS")
    //console.log("TRYING TO DELETE REVIEWS");
    let id = req.params.id;
    let reviewId  = req.params.reviewsId;
    // console.log(reviewId);
    // console.log(id);
    let re2 = await Review.findByIdAndDelete(reviewId);
    let re1 = await placeList.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash("error","Review deleted Successfully");
    // console.log("TRYING TO DELETE REVIEWS");
    // console.log(re1);
    // console.log(re1);
    // console.log(re2);
    // console.log(re2);
    res.redirect(`/listings/${id}`);
}));


module.exports = router;