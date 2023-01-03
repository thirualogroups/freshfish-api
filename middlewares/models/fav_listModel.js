var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var fav_listSchema = new mongoose.Schema({
    user_id:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdetails"
    },
    product_details_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product_details"

    },
    fav_status: Boolean,
    pincode:Number,

});

fav_listSchema.plugin(timestamps);
mongoose.model('fav_list', fav_listSchema);
module.exports = mongoose.model('fav_list');