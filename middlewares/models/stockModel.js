const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const stockSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "store"
    },
    fish_combo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "fish_combo_master",
        required: [true, "Fish Combo Id field is required"]
    },
    price: {
        type: Number,
        required: [true, "Price field is required"]
    },
    gross_weight: {
        type: Number,
        required: [true, "Gross weight field is required"]
    },
    unit: {
        type: String,
        required: [true, "unit fiel is required"]
    },
    soldout: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true,
        required: [true, "Status field is required"]
    },
    delete_status: {
        type: Boolean,
        default: false
    }
});
stockSchema.index({ store: 1, fish_combo_id: 1, delete_status: 1 }, { unique: true });
stockSchema.plugin(timestamps);
mongoose.model('stock', stockSchema);
module.exports = mongoose.model('stock');
