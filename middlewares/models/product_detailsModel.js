var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var product_detailsSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'product_vendor',
  },
  cat_id: {
    type: Schema.Types.ObjectId,
    ref: 'product_categ',
  },
  thumbnail_image: String,
  product_img: Array,
  fish_combo_id: {
    type: Schema.Types.ObjectId,
    ref: "fish_combo_master"
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "store"
  },
  cost: {
    type: Number,
    required: [true, "cost field is mandatory"]
  },
  product_discription: String,
  condition: String,
  variation: {
    type: Number,
    required: [true, "variation field is required"]
  },
  price_type: {
    type: String,
    enum: ["Gross","Net","Pack","No","Lot"],
    required: [true, "price_type field is required"]
  },
  addition_detail: Array,

  date_and_time: String,
  mobile_type: String,

  related: String,
  count: Number,
  status: Boolean,
  verification_status: String,
  delete_status: {
    type: Boolean,
    default: false
  },
  fav_status: Boolean,
  today_deal: Boolean,
  discount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  discount_status: {
    type: Boolean,
    default: false
  },
  discount_cal: {
    type: Number,
    default: 0
  },
  discount_start_date: String,
  discount_end_date: String,
  product_rating: {
    type: Number,
    default: 0
  },
  product_review: {
    type: Number,
    default: 0
  },
  gross_weight: {
    type: Number,
    default: 0
  },
  min_net_weight: {
    type: Number,
    default: 0
  },
  max_net_weight: {
    type: Number,
    default: 0
  },
  unit: String,
  recommendation: {
    type: Boolean,
    default: false
  },
  customer_information: {
    type: [String],
    default: []
  },
  soldout:{
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

product_detailsSchema.virtual('variation_list').get(function () {
  try {
    let calc_disc = (variation, gross_wt) => {
      let discount = this.cost === 0 ? 0 : (this.discount_amount * variation - this.discount_amount);
      let amount = ((this.cost * gross_wt) - discount);
      return { cost: amount, discount: discount };
    }

    if (this.unit && this.price_type) {
      //base discount is in 0.5 kg or 1 lot
      let arr = this.unit.toLowerCase() === "kg" && this.variation === 0.5 ? [0.5, 1.0, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : [1, 2, 3, 4, 5];
      return arr.map((x, i) => { return { title: x + " " + this.unit.toUpperCase(), min_net_weight: (this.min_net_weight * (i + 1)), net_weight: (this.max_net_weight * (i + 1)), gross_weight: (this.gross_weight * (i + 1)), ...calc_disc(i + 1, (this.gross_weight * (i + 1))) } });
    }
    else {
      return [];
    }
  }
  catch (ex) {
    console.log(ex);
    return [];
  }
});

product_detailsSchema.virtual('variation_list').get(function (stock_price) {
  try {
    let price = this.cost === 0 ? stock_price : this.cost;
    let calc_disc = (variation, gross_wt) => {
      let discount = price === 0 ? 0 : (this.discount_amount * variation - this.discount_amount);
      let amount = ((price * gross_wt) - discount);
      return { cost: amount, discount: discount };
    }

    if (this.unit && this.price_type) {
      //base discount is in 0.5 kg or 1 lot
      let arr = this.unit.toLowerCase() === "kg" && this.variation === 0.5 ? [0.5, 1.0, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : [1, 2, 3, 4, 5];
      return arr.map((x, i) => { return { title: x + " " + this.unit.toUpperCase(), min_net_weight: (this.min_net_weight * (i + 1)), net_weight: (this.max_net_weight * (i + 1)), gross_weight: (this.gross_weight * (i + 1)), ...calc_disc(i + 1, (this.gross_weight * (i + 1))) } });
    }
    else {
      return [];
    }
  }
  catch (ex) {
    console.log(ex);
    return [];
  }
});

product_detailsSchema.plugin(timestamps);

mongoose.model('product_details', product_detailsSchema);
module.exports = mongoose.model('product_details');
