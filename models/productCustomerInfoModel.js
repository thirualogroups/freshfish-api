const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const productCustomerInfoSchema = new mongoose.Schema({
    info: {
        type: String,
        required: [true, "info field is required"]
    },
    delete_status: {
        type: Boolean,
        default: false
    }
});

productCustomerInfoSchema.plugin(timestamps);
mongoose.model("product_customer_information", productCustomerInfoSchema);
module.exports = mongoose.model("product_customer_information");
