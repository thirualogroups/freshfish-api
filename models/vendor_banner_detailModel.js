var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var vendorbannerSchema = new mongoose.Schema({  
  img_path:  String,
  img_title : String,
  img_describ : String,
  img_index : Number,
  show_status : Boolean,
  date_and_time : String,
  delete_status : Boolean,
});
vendorbannerSchema.plugin(timestamps);
mongoose.model('vendorbanner', vendorbannerSchema);
module.exports = mongoose.model('vendorbanner');