var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var cart_detailSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user_details'
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'product_details',
  },
  cat_id: {
    type: Schema.Types.ObjectId,
    ref: 'product_categ',
  },
  net_weight: {
    type: Number,
    required: [true, "net_weight field is mandatory"]
  },
  gross_weight: {
    type: Number,
    required: [true, "gross_weight field is mandatory"]
  },
  delete_status: {
    type: Boolean,
    default: false
  },
  pincode: String,
  customer_information: Array
});
cart_detailSchema.plugin(timestamps);
mongoose.model('cart_detail', cart_detailSchema);
module.exports = mongoose.model('cart_detail');