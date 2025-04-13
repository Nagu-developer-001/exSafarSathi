const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();
const User = require('./models/User'); // Assuming User schema is defined
const Booking = require('./models/Booking'); // Assuming Booking schema is defined

// Booking Schema Example (Ensure your schema has these fields)
const bookingSchema = new mongoose.Schema({
    title: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingCount: { type: Number, default: 0 }
});

const Booking = mongoose.model('Booking', bookingSchema);

// User Schema Example (With hasBooked field)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    hasBooked: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// GET booking page
app.get('/booking/:id/confirm', async (req, res) => {
    const userId = req.user._id;  // Assume user is logged in
    const bookingId = req.params.id;

    const user = await User.findById(userId);
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).send('Booking not found');
    if (!user) return res.status(404).send('User not found');

    if (user.hasBooked) {
        return res.status(403).send('You have already booked once.');
    }

    // Increment booking count
    booking.bookingCount = (booking.bookingCount || 0) + 1;
    await booking.save();

    // Mark user as booked
    user.hasBooked = true;
    await user.save();

    // Send notifications using Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'your_email@gmail.com', pass: 'your_password' }
    });

    await transporter.sendMail({
        from: '"Booking System" <your_email@gmail.com>',
        to: booking.owner.email,
        subject: `New Booking Confirmed - ${booking.title}`,
        text: `A user has booked your listing! Contact details: ${user.email}`
    });

    await transporter.sendMail({
        from: '"Booking System" <your_email@gmail.com>',
        to: user.email,
        subject: `Booking Confirmation - ${booking.title}`,
        text: `Your booking has been confirmed! Owner Contact: ${booking.owner.email}`
    });

    // Redirect user back after confirmation
    res.redirect(`/booking/${bookingId}`);
});