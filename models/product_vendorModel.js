var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const time_column = {
  type: String,
  valiate: {
    validator: function (v) {
      return /\d{2}:\d{2} ["A","P"]["M"]/.test(v);
    }
  },
  message: props => `${props.value} is not a valid time format`
};

var product_vendorSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "userdetails"
  },
  user_name: String,
  user_email: String,
  bussiness_name: String,
  bussiness_email: String,
  bussiness: String,
  bussiness_phone: String,
  business_reg: String,
  bussiness_gallery: Array,
  photo_id_proof: String,
  govt_id_proof: String,
  certifi: Array,
  date_and_time: String,
  mobile_type: String,
  profile_status: Boolean,
  profile_verification_status: String,
  bussiness_loc: String,
  bussiness_lat: Number,
  bussiness_long: Number,
  bussiness_pincodes: String,
  delete_status: Boolean,
  pincodes: Array,
  store: {
    type: Schema.Types.ObjectId,
    ref: "store"
  },
  code: String,
  status: {
    type: Boolean,
    default: true
  },
  _default: {
    type: Boolean,
    default: false
  },
  delivery_slots: {
    type: [new mongoose.Schema({
      delivery_days: {
        type: [String]
      },
      delivery_start_time: time_column,
      delivery_end_time: time_column,
      order_ends_before: time_column
    })]
  }
}, {
  toJSON: { virtual: true }
});
product_vendorSchema.plugin(timestamps);
mongoose.model('product_vendor', product_vendorSchema);
module.exports = mongoose.model('product_vendor');
