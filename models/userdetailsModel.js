var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var userdetailsSchema = new mongoose.Schema({

  first_name: String,
  last_name: String,
  user_email: String,
  user_email_verification: Boolean,
  user_phone: String,
  date_of_reg: String,
  profile_img: String,
  otp: Number,
  user_type: Number,
  user_status: String,
  fb_token: String,
  device_id: String,
  device_type: String,
  mobile_type: String,
  delete_status: Boolean,
  ref_code: String,
  my_ref_code: String,
  pincodes: Number,
  city: String,
  last_order_date: Date,
  agent: {
    type: Schema.Types.ObjectId,
    ref: "product_vendor"
  },
  door_no: String,
  apartment: String,
  address: String
});
userdetailsSchema.plugin(timestamps);
mongoose.model('userdetails', userdetailsSchema);
module.exports = mongoose.model('userdetails');
