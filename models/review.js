const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewing = new Schema({
    rating:{
        type:Number,
        min:1,
        max:5
    },
    comment:String,
    createdAt:{
        type:Date,
        default:new Date()
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model("Review",reviewing);