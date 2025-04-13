const mongoose = require("mongoose");
const review = require("./review");
const Booking = require("./booking");
const Schema = mongoose.Schema;
const placeSchema =  new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String
    },
    image:{
        url:String,
    },
    price:{
        type:Number,
    },
    location:{
        type:String
    },
    country:{
        type:String,
    },
    category:{
        type:String,
        enum:["Trending","rooms","iconicCities","Mountains","Castles","Religion","Camping","Farms","Arctic","Waterfall"]
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
    }
});
placeSchema.post("findOneAndDelete",async (Listing)=>{
    console.log(Listing,"POST MIDDLEWARE");
    let res = await review.deleteMany({_id:{$in:Listing.reviews}});
    let res1 = await Booking.deleteMany({title:Listing.title});
});
const placeList = new mongoose.model("placeList",placeSchema);

module.exports = placeList;