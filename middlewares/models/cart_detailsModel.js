var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var cart_detailsSchema = new mongoose.Schema({
    user_id:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetails"
    },
    product_details_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product_details"

    },
    category:String,
    disamount:Number,
    max_net:String,
    min_net:String,
    product_price:Number,
    product_quantity:String,
    product_title:String,
    store:String,
    total_amt:String,
    unit:String,
    value:String,
    gross_weight:String,
    customer_info:String,
    delete_status:{
        type: Boolean,
        default: false
    },

});

cart_detailsSchema.plugin(timestamps);
mongoose.model('cart_details', cart_detailsSchema);
module.exports = mongoose.model('cart_details');