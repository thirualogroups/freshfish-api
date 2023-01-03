var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 1 }
});

CounterSchema.plugin(timestamps);
mongoose.model('counter', CounterSchema);
module.exports = mongoose.model('counter');
