const { number } = require("joi");
const mongoose = require("mongoose");
// const User = require("./user.js");
const Schema = mongoose.Schema;
const bookingSchema = new Schema({
    // place_id:
    title: String,
    // price:Number,
    // ownedBy:String,
    // location:String,
    places_list:{
            type:Schema.Types.ObjectId,
            ref:"placeList"
    },
    owner: 
    {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    bookingCount: { type: Number, default: 0 }
});


const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;