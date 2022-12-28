var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var locationdetailsSchema = new mongoose.Schema({  
  user_id  : {  
       type: Schema.Types.ObjectId,
       ref: 'userdetails',
      },
  location_state : String,
  location_country : String,
  location_city : String,
  location_pin : String,
  location_address : String,
  location_lat : Number,
  location_long : Number,
  location_title : String,
  location_nickname : String,
  default_status : Boolean,
  date_and_time : String,
  mobile_type : String,
  delete_status : Boolean,
  location_address_1: String,
  location_address_2: String,
  phone_no : String
});
locationdetailsSchema.plugin(timestamps);
mongoose.model('locationdetails', locationdetailsSchema);
module.exports = mongoose.model('locationdetails');