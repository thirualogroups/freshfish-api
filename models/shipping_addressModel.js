var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var shippingdetailsSchema = new mongoose.Schema({  
  user_id : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdetails",
    required: [true, "user_id is mandatory"]
  },
  first_name :  String,
  last_name : String,
  flat_no : String,
  street : String,
  landmark : String,
  pincode : String,
  city : String,
  state : String,
  mobile : String,
  alter_mobile : String,
  address_status : String,
  address_type : String,
  address: String,
  display_date : String,
  houseno: String,
  Additional_Phone_No: Number,
  delete_status:{
    type: Boolean,
    default: false
},
default_status:{
  type: Boolean,
  default: false
},
});
shippingdetailsSchema.plugin(timestamps);
mongoose.model('shippingdetails', shippingdetailsSchema);
module.exports = mongoose.model('shippingdetails');