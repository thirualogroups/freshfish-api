var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var product_favSchema = new mongoose.Schema({  
  user_id : String,
  product_id : {  
       type: Schema.Types.ObjectId,
       ref: 'product_details',
      },
  mobile_type : String,
  delete_status : Boolean,
});
product_favSchema.plugin(timestamps);
mongoose.model('product_fav', product_favSchema);
module.exports = mongoose.model('product_fav');