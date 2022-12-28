var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var transaction_logsSchema = new mongoose.Schema({
  order_id:String,
  currency: String,
  txnamount: Number,
  txtnid: String,
  status: String,
  respcode: String,
  respmsg: String
});

transaction_logsSchema.plugin(timestamps);

mongoose.model('transaction_logs', transaction_logsSchema);
module.exports = mongoose.model('transaction_logs');
