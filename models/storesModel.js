const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const Schema = mongoose.Schema;

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name field is required"]
    },
    phoneno: String,
    email: String,
    location: String,
    type: String,
    code: String,
    address: String,
    status: {
        type: Boolean,
        default: true
    },
    delete_status: {
        type: Boolean,
        default: false
    }
});


storeSchema.plugin(timestamps);
mongoose.model("store", storeSchema);
module.exports = mongoose.model("store");
