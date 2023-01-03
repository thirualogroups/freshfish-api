var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var new_product_detailsSchema = new mongoose.Schema({ 
  cat_id : {
        type: Schema.Types.ObjectId, 
        ref: 'product_categ',
    },
  // sub_cat_id : {
  //       type: Schema.Types.ObjectId, 
  //       ref: 'product_sub_cate',
  //   },
  cat_type :[{
          type: Schema.Types.ObjectId, 
          ref: 'cattype',
      }],
  fish_type : [{
          type: Schema.Types.ObjectId, 
          ref: 'fishtype',
      }],
  age : Array,

  product_discription : String,
  product_img : Array,
  thumbnail_image : String,
  product_name : String,
  date_and_time : String,
  delete_status : Boolean,
});
new_product_detailsSchema.plugin(timestamps);
mongoose.model('new_product_details', new_product_detailsSchema);
module.exports = mongoose.model('new_product_details');
