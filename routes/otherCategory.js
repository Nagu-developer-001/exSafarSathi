const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const { UniqueUrl } = require("../AuthenticLogin.js");
const placeList = require("../models/wonderLust.js");
const { isLogined, listOwner } = require("../AuthenticLogin.js");
const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");


// Booking Route
router.get("/booking/:id", isLogined, async (req, res, next) => {
    try {

        const userId = req.user._id;
        const bookingId = req.params.id;

        console.log("User ID:", userId, "Booking ID:", bookingId);

        const user = await User.findById(userId);
        const places = await placeList.findById(bookingId).populate("owner");
        
        if (places.owner._id.equals(userId)) {
            req.flash("error", "You cannot book your own listing.");
            return res.redirect(`/listings/${bookingId}`);
        }

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

        // **Generate PDF for the booking confirmation**
// Sample booking data
// const bookings = [
//     { eventName: "Music Concert", createdDate: "2024-04-10", eventDate: "2024-05-12", price: "500", viewedByAdmin: true, completed: false },
//     { eventName: "Art Exhibition", createdDate: "2024-04-15", eventDate: "2024-06-05", price: "300", viewedByAdmin: false, completed: true }
// ];

    const doc = new jsPDF();
    doc.text("My Bookings", 14, 20);

    // **Manually Add Table Data**
    let startY = 40;
    doc.setFont("helvetica", "bold");
    doc.text("Place name        Price    ", 14, startY);

    doc.setFont("helvetica", "normal");
    //let index = 0;
    //for (const b of places) {
    startY += 10; // Increment Y position for each row
    doc.text(
        `${places.title}    ₹${places.price}`,
        14,
        startY
    );
    //index++;
//}


    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=My_Bookings.pdf");
    res.send(doc.output());

    } catch (error) {
        next(error);
    }
});

// Delete Booking Route
router.delete("/del/:id", isLogined, async (req, res, next) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        req.flash("success", "Successfully cancelled your booking order");
        return res.redirect(`/listings`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// FAQ Page Route
router.get("/FAQ", UniqueUrl, (req, res) => {
    return res.render("./listings/faq.ejs");
});

// Help Page Route
router.get("/help", UniqueUrl, (req, res) => {
    return res.render("./listings/help.ejs");
});

// Search Route
router.get("/search", async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
});

module.exports = router;