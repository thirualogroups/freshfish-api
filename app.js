var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var pdf = require('html-pdf');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
var fs = require('fs');
var pug = require('pug');
var request = require("request");
const mongoose = require("mongoose");

var responseMiddleware = require('./middlewares/response.middleware');

/*Routing*/


var userdetails = require('./routes/userdetails.routes');
var product_vendor = require('./routes/product_vendor.routes');
var store = require("./routes/store.routes");
var fish_combo_master = require("./routes/fish_combo_master.routes");
var product_cate = require('./routes/product_categories.routes');
var vendor_banner_detail = require('./routes/vendor_banner_detail.routes');
var newproduct_detail = require('./routes/newproduct_detail.routes');
var order_details = require('./routes/order_details.routes');
var product_customer_info = require('./routes/product_customer_info.routes');
var stock = require("./routes/stock.routes");
var product_details = require('./routes/product_details.routes');
var shippingdetails = require('./routes/shippingdetails.routes');


/*Database connectivity*/

var BaseUrl = "http://ec2-44-208-166-141.compute-1.amazonaws.com:3000/api";


mongoose.connect('mongodb://localhost:27017/freshfish_database');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
  console.log("connection succeeded");
})

var app = express();

app.use(fileUpload());
app.use(responseMiddleware());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'pug');

/*Response settings*/

app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', "http://localhost:4200");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
  next();
});




app.post('/api/upload', function (req, res) {
  let sampleFile;
  let uploadPath;
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    res.error(300, 'No files were uploaded.');
    return;
  }
  console.log('req.files >>>', req.files); // eslint-disable-line
  sampleFile = req.files.sampleFile;
  var exten = sampleFile.name.split('.');
  console.log(exten[exten.length - 1]);
  var filetype = exten[exten.length - 1];
  uploadPath = __dirname + '/public/uploads/' + new Date().getTime() + "." + filetype;
  var Finalpath = BaseUrl + '/uploads/' + new Date().getTime() + "." + filetype;
  console.log("uploaded path", uploadPath)
  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      console.log(err)
      return res.error(500, "Internal server error");
    }
    res.json({ Status: "Success", Message: "file upload success", Data: Finalpath, Code: 200 });
  });
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/', express.static(path.join(__dirname, 'routes')));
console.log(express.static(path.join(__dirname, '/public')));
app.use('/api/', express.static(path.join(__dirname, '/public')));




app.use('/api/userdetails', userdetails);
app.use('/api/product_vendor', product_vendor);
app.use('/api/store', store);
app.use('/api/fish_combo_master', fish_combo_master);
app.use('/api/product_cate', product_cate);
app.use('/api/vendor_banner_detail', vendor_banner_detail);
app.use('/api/newproduct_detail', newproduct_detail);
app.use('/api/order_details', order_details);
app.use('/api/product_customer_info', product_customer_info);
app.use('/api/stock', stock);
app.use('/api/product_details', product_details);
app.use('/api/shipping_address', shippingdetails);
app.use('/api/transaction-logs', require("./routes/transaction_logs.routes.js"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


global.send_sms = function(mobilno, message, templateid){
  return new Promise((resolve, reject)=>{
    const username = "Freshfishecr";
    const password = 14790;
    const sid = "FRFISH";
    const type = 0;
    const baseurls = `http://www.smsintegra.com/api/smsapi.aspx?uid=${username}&pwd=${password}&mobile=${mobilno}&msg=${message}&sid=${sid}&type=${type}&entityid=1601747165666113478&tempid=${templateid}`;
    request(baseurls, { json: true }, async (err, response, body) => {
      if (err) reject(err);
      else resolve(body);
    });
  });
}

