var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var order_detailSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdetails"
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product_vendor"
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "store"
  },
  order_id: String,
  order_details: [new mongoose.Schema({
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_details",
      required: [true, "product_id field is mandatory"]
    },
    fish_combo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fish_combo_master",
      required: [true, "fish_combo_id field is mandatory"]
    },
    net_weight: {
      type: Number,
      required: [true, "net_weight field is mandatory"]
    },
    gross_weight: {
      type: Number,
      required: [true, "gross_weight field is mandatory"]
    },
    price: {
      type: Number,
      required: [true, "price field is mandatory"]
    },
    discount: {
      type: Number,
      required: [true, "discount field is mandatory"]
    },
    amount: {
      type: Number,
      required: [true, "amount field is mandatory"]
    },
    unit: {
      type: String,
      required: [true, "unit field is mandatory"]
    },
    customer_information: String,
    delete_status: {
      type: Boolean,
      default: false
    }
  })],
  order_item_count: String,
  order_booked_at: Date,
  order_deliver_date: Date,
  order_deliver_status: String,
  order_return_date: Date,
  order_return_reason: String,
  order_feedback: String,
  order_delivered_id: String,
  order_value: Number,
  order_coupon_code: String,
  order_coupon_code_value: Number,
  order_final_amount: Number,
  order_status: {
    type: String,
    default: "Booked"
  },
  out_for_delivery: {
    type: Boolean,
    default:false
  },
  delete_status: {
    type: Boolean,
    default: false
  },
  payment_method: String,
  payment_id: String,
  shippingid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shippingdetails"
  },
  shipping_address: {
    type: Map
  },
  slot_date: Date,
  slot_time: String,
  addl_phone_no: String,
  device_type: String,
  logs: [new mongoose.Schema({
    _id: false,
    status: String,
    datetime: Date
  })]

});

order_detailSchema.plugin(timestamps);
mongoose.model('order_detail', order_detailSchema);
module.exports = mongoose.model('order_detail');
