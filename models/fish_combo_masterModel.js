var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var fresh_fish_masterSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: [true, "product_name field is mandatory"]
  },
  code: String,
  delete_status: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0
  }
});
fresh_fish_masterSchema.plugin(timestamps);
mongoose.model('fish_combo_master', fresh_fish_masterSchema);
module.exports = mongoose.model('fish_combo_master');