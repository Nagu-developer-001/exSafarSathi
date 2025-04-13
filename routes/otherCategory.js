const express = require("express");
const router = express.Router({mergeParams:true});
const User = require("../models/user.js");
// Assuming User schema is defined
const Booking = require("../models/booking.js");
const {UniqueUrl} = require("../AuthenticLogin.js");
const placeList = require("../models/wonderLust.js");
const {isLogined,listOwner} = require("../AuthenticLogin.js");
const wrapAsync = require("../utils/wrapAsync.js");


router.get('/booking/:id', isLogined,wrapAsync(async (req, res) => {
    const userId = req.user._id;  // Assume user is logged in
    const bookingId = req.params.id;

    console.log(userId, bookingId);

    const user = await User.findById(userId);
    const places = await placeList.findById(bookingId).populate("owner");

    // Check if the user has already booked this accommodation
    let existingBooking = await Booking.findOne({ owner: userId, title: places.title });
    console.log("ids ---",existingBooking,bookingId,places._id);
    if (existingBooking) {
        console.log( "You have already booked this accommodation.");
        req.flash("error", "You have already booked this accommodation.");
        return res.redirect(`/listings/${bookingId}`);
    }

    let newBooking = new Booking({
        bookingCount: 1,
        title:places.title,
        places_list:bookingId,
        owner: userId
    });

    await newBooking.save();

    // Mark user as booked
    user.hasBooked = true;
    await user.save();
    req.flash("success", "Thank you for your registration!");
    let email_To_User = req.user.email;
    let email_To_Owner = user.email;

    // const send = require('gmail-send')({
    //     user: 'trivikramagroupofltd@gmail.com',
    //     pass: 'szinrtyyqykbyzxu',
    //     to: email_To_User,
    //     subject: 'No Replay Email.',
    // });

    // send({
    //     html: `Successfully booked your accommodation in ${places.title} located near ${places.location}. Price without tax - ${places.price}`,
    // }, async (error, result, fullResult) => {
    //     console.error(fullResult, error);
    // });

    // const sender = require('gmail-send')({
    //     user: 'trivikramagroupofltd@gmail.com',
    //     pass: 'szinrtyyqykbyzxu',
    //     to: email_To_Owner,
    //     subject: 'No Replay Email.',
    // });

    // sender({
    //     html: `<p>If you agree with the updation of password, please enter your OTP - </p>`,
    // }, async (error, result, fullResult) => {
    //     console.error(fullResult, error);
    // });

    res.redirect(`/listings/${bookingId}`);
}));
router.delete('/del/:id',isLogined,wrapAsync( async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        req.flash("success", "Successfully cancelled Your Booking order");
        res.redirect(`/listings`);
    } catch (error) {
        res.status(500).send(error);
    }
}));
router.get("/FAQ",UniqueUrl,wrapAsync((req,res)=>{
    res.render("./listings/faq.ejs");
}));
router.get("/help",UniqueUrl,wrapAsync((req,res)=>{
    res.render("./listings/help.ejs")
}));

router.get("/search",wrapAsync(async(req,res)=>{
    let {searchQuery} =  req.query;
    let pricers = searchQuery.match(/\d+/g);
    if(searchQuery){
        req.session.searchQuery = searchQuery;
        let allListing = await placeList.find({$or:[{title:{  $regex: searchQuery,$options: 'i' }}]});
        console.log(`searching for ${allListing}`);
        console.log(typeof allListing);
        if (Object.keys(allListing).length === 0){
            req.flash("error", "Sorry there no such place list!!!");
            res.redirect(`/listings`);
                
        }else{
            res.render("listings/index.ejs",{allListing});
        }
        
    }else{
        req.flash("error", "Sorry there no such place list!!!");
        res.redirect(`/listings`);
    }
}));

module.exports = router;