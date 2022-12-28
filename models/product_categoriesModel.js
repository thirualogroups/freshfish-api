var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var product_categSchema = new mongoose.Schema({  
  img_path:  String,
  product_cate : String,
  img_index : Number,
  show_status : Boolean,
  date_and_time : String,
  delete_status : Boolean,
});
product_categSchema.plugin(timestamps);
mongoose.model('product_categ', product_categSchema);
module.exports = mongoose.model('product_categ');