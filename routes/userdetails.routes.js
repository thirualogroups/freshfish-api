var express = require('express');
var router = express.Router();
const requestss = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var GeoPoint = require('geopoint');
var process = require('process');

var order_detailsModel= require('./../models/order_detailsModel')
var userdetailsModel = require('./../models/userdetailsModel');
var locationdetailsModel = require('./../models/locationdetailsModel');
var product_categoriesModel = require('./../models/product_categoriesModel');
const product_vendorModel = require('./../models/product_vendorModel');






///////////////New Admin Rework//////////////////
router.post('/create', async function (req, res){

  let user = await userdetailsModel.findOne({user_type:1,user_phone: req.body.user_phone, delete_status: false});
  if (user == null) {
  try {
    if (req.body.ref_code && req.body.ref_code !== '') {
      var ref_code_details = await userdetailsModel.findOne({ my_ref_code: req.body.ref_code });
      if (ref_code_details == null) {
        res.json({ Status: "Failed", Message: "Referral code not found", Data: {}, Code: 404 });
        process.exit(1);
      }
    }

    let phone = await userdetailsModel.findOne({user_type:3,user_phone: req.body.user_phone, delete_status: false});
    let random = 123456;
    
    if (phone !== null) {
      if (phone.user_status == 'Incomplete') {
        let a = {
          user_details: phone
        }

        const message = `Dear ${req.body.first_name+" "+req.body.last_name}, your login One Time Password is ${random}.-We Know How To Choose Fresh Fish`;;
        global.send_sms(req.body.user_phone, message,"1607100000000220483").then(response=>{
          res.json({ Status: "Success", Message: "Sign Up Successfully! Welcome To Fresh Fish", Data: a, Code: 200 });
        }).catch(err=>{
          res.status(500).send(err);
        });

        
      } else {
        res.json({ Status: "Failed", Message: "This Phone Number Already Registered", Data: {}, Code: 404 });
      }
    } else {
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      for (var i = 0; i < 7; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }

      const agents = await product_vendorModel.find({ _default: true });
      let default_agent;
      if (agents.length > 0) {
        default_agent = agents[0]._id;
      }

      await userdetailsModel.create({
        first_name: req.body.first_name || "",
        last_name: req.body.last_name || "",
        user_email: req.body.user_email || "",
        user_phone: req.body.user_phone || "",
        date_of_reg: req.body.date_of_reg || "",
        user_type: req.body.user_type || 1,
        ref_code: req.body.ref_code || "",
        my_ref_code: result || "0000000",
        user_status: req.body.user_status || "complete",
        otp: random || 0,
        profile_img: "",
        user_email_verification: req.body.user_email_verification || false,
        fb_token: "",
        device_id: "",
        device_type: "",
        mobile_type: req.body.mobile_type || "",
        delete_status: false,
        pincodes: req.body.pincodes,
        city: req.body.city,
        agent: default_agent,
        door_no: req.body.door_no,
        apartment: req.body.apartment,
        address: req.body.address,
        latest_orderid:""
      },
        function (err, user) {
          let a = {
            user_details: user
          }
          if (err) return console.log(err);
          else res.json({ Status: "Success", Message: "Sign Up Successfully! Welcome To Fresh Fish", Data: a, Code: 200 });
        });
    }
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
}else{
  res.status(400).json({Status:"Failed",Message:"User Phone Number Already Exist", Data : {} ,Code:400});
}
});


router.post('/agent/create', async function (req, res){

  try {
    let phone = await userdetailsModel.findOne({user_phone:req.body.user_phone, delete_status: false,});
    if (phone !== null) {
    userdetailsModel.findByIdAndUpdate(phone._id, req.body, { new: true }, function (err, UpdatedDetails) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: "User Details Updated Successfully", Data: UpdatedDetails, Code: 200 });
    });
    } else {

       const agents = await product_vendorModel.find({ _default: true });
      let default_agent;
      if (agents.length > 0) {
        default_agent = agents[0]._id;
      }




       await userdetailsModel.create({
        first_name: req.body.first_name || "",
        last_name: req.body.last_name || "",
        user_email: req.body.user_email || "",
        user_phone: req.body.user_phone || "",
        date_of_reg: req.body.date_of_reg || "",
        user_type: req.body.user_type || 1,
        ref_code: req.body.ref_code || "",
        my_ref_code: "" || "0000000",
        user_status: req.body.user_status || "complete",
        otp: '' || 0,
        profile_img: "",
        user_email_verification: req.body.user_email_verification || false,
        fb_token: "",
        device_id: "",
        device_type: "",
        mobile_type: req.body.mobile_type || "",
        delete_status: false,
        pincodes: req.body.pincodes,
        city: req.body.city,
        agent: default_agent,
        door_no: req.body.door_no,
        apartment: req.body.apartment,
        address: req.body.address,
        latest_orderid:""

      },
        function (err, user) {
           console.log(err);
          if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
          res.json({ Status: "Success", Message: "User Details Added Successfully", Data: user, Code: 200 });
          });
    }
  }
  catch (e) {
    console.log(e);
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});
router.post('/agent/update',async function (req, res){
  let a={
    agent:req.body.agent

  };

  await userdetailsModel.findByIdAndUpdate(req.body.user_id,a,{new:true},function (err, user) {
    console.log(err);
   if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
   res.json({ Status: "Success", Message: "User Details Added Successfully", Data: user, Code: 200 });
   });


});



router.get('/getlist', function (req, res) {
    let params = { delete_status: false };
    if (req.query.user_type && req.query.user_type != "") {
      params.user_type = req.query.user_type;
    }
    userdetailsModel.find(params).populate("agent", ["user_name", "bussiness_name", "code"]).then(list => {
      res.json({ Status: "Success", Message: "User Details Details", Data: list, Code: 200 });
    }).catch(error => {
      res.json({ Status: "Fail", Message: "User Details Details", Data: error.message, Code: 500 });
    });
});


 router.get('/deletes', function (req, res) {
    userdetailsModel.remove({}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
    });
 });

  router.post('/edit', async function (req, res) {
    if(req.body.agent_code){
      req.body.agent = (await product_vendorModel.findOne({code:req.body.agent_code},{_id:1}))?._id;
    }
    userdetailsModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: "User Details Updated", Data: UpdatedDetails, Code: 200 });
    });
  });


  router.post('/check_customer', async function (req, res) {
    userdetailsModel.findOne({user_phone: req.body.user_phone,user_type:1}, function (err, valuess) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      if(valuess == null){
         res.json({ Status: "Success", Message: "Number Not available", Data: {}, Code: 404 });
       }else{
           res.json({ Status: "Success", Message: "Already there is a customer", Data: valuess, Code: 200 });
       }
    });
  });



  router.post('/delete', function (req, res) {
    let c = {
      delete_status: true
    }
    locationdetailsModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: "Location Deleted successfully", Data: UpdatedDetails, Code: 200 });
    });
  });


  // // DELETES A USER FROM THE DATABASE
  router.post('/admin_delete', function (req, res) {
    userdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: "User Details Deleted successfully", Data: {}, Code: 200 });
    });
  });


 router.get('/deletes_customer', function (req, res) {
    userdetailsModel.remove({user_type:1}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
    });
 });


router.get('/getlist_count', function (req, res) {
    userdetailsModel.find({}, function (err, StateList) {
    StateList.forEach(element => {
     if(""+element.user_phone !== "7358317671"){
    userdetailsModel.findByIdAndRemove(element._id, function (err, user) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    });
     }
    });
        res.json({ Status: "Success", Message: "Vendor List", Data: StateList, Code: 200 });
    });
});

router.post('/user_update',async function (req, res){
  let a={
    latest_orderid:req.body.latest_orderid

  };

  await userdetailsModel.findByIdAndUpdate(req.body.user_id,a,{new:true},function (err, user) {
    console.log(err);
   if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
   res.json({ Status: "Success", Message: "User Details Added Successfully", Data: user, Code: 200 });
   });


});

router.get('/user_getlist', async function (req, res) {
  let params = { delete_status: false };
    params._id = req.query.user_id;

  await userdetailsModel.find(params).then(list => {
    res.json({ Status: "Success", Message: "User Details Details", Data: list, Code: 200 });
  }).catch(error => {
    res.json({ Status: "Fail", Message: "User Details Details", Data: error.message, Code: 500 });
  });
});



///////////////////




////////// payment Process ////////////



  function paytm_credentials() {
    return {
      "mid": "THINKI09196151683246",
      "mkey": "LsE@@ejAZ&Z#r3#m",
      //"Website (For web)" : "WEBSTAGING",
      "website": "APPSTAGING",
      //"Channel id: (For web)" : "WEB",
      "channelid": "WAP",
      "industryid": "Retail"
    }
  }
  router.get("/paytm_credentials", function (req, res) {
    res.send(paytm_credentials());
  })

  router.post("/payment_initiate", async function (req, res) {
    try {
      const https = require('https');
      const PaytmChecksum = require('paytmchecksum');
      const { v4: uuidv4 } = require('uuid');
      let credentials = paytm_credentials();
      let orderid = uuidv4();
      let callbackurl = "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + orderid;
      var paytmParams = {};
      paytmParams.body = {
        "requestType": "Payment",
        "mid": credentials.mid,
        "websiteName": credentials.website,
        "orderId": orderid,
        "callbackUrl": callbackurl,
        "txnAmount": {
          "value": parseFloat(req.body.amount).toFixed(2).toString(),
          "currency": "INR",
        },
        "userInfo": {
          "custId": req.body.userid,
        },
      };

      

      /*
      * Generate checksum by parameters we have in body
      * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
      */
      PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), credentials.mkey).then(function (checksum) {

        paytmParams.head = {
          "signature": checksum
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {

          /* for Staging */
          hostname: 'securegw-stage.paytm.in',

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: '/theia/api/v1/initiateTransaction?mid=' + credentials.mid + '&orderId=' + orderid,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
          }
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on('data', function (chunk) {
            response += chunk;
          });

          post_res.on('end', function () {

            response = JSON.parse(response);
            let result = {
              mid: credentials.mid,
              orderid: orderid,
              txnToken: response.body.txnToken,
              amount: parseFloat(req.body.amount).toFixed(2).toString(),
              callbackurl: callbackurl,
              environment: "staging"
            }
            res.send({ "Status": response.body.resultInfo.resultMsg, Data: result, Code: 200 });
          });
        });

        post_req.write(post_data);
      });
    }
    catch (ex) {
      res.send({ "Status": "Failed", Message: ex.message, Code: 500 });
    }
  });



  router.get('/adminpanel/Dashboard/count', async function (req, res) {
    var user_count = await userdetailsModel.find({user_type:1});
    var agent_count = await product_vendorModel.find({delete_status: false},{ delete_status: 0, __v: 0 });
    var order_count = await order_detailsModel.find({createdAt:new Date()});
    var total_order_amount = 0;
     order_count.forEach(element => {

     total_order_amount = total_order_amount + element.order_final_amount;
      });
    let datas = {
      customer_count : user_count.length,
      no_of_agent : agent_count.length,
      total_order_amount : total_order_amount,
      order_count : order_count.length,
    }
    res.json({ Status: "Success", Message: "Dashboard Details", Data: datas, Code: 200 });
 });




  //  router.post('/adminpanel/Dashboard/count', async function (req, res) {
  //    var user_count = await userdetailsModel.find({user_type:1});
  //    var agent_count = await product_vendorModel.find({delete_status: false},{ delete_status: 0, __v: 0 });
  //    var order_count = await order_detailsModel.find({createdAt: {
  //    $gte: new Date(req.body.start_date),
  //    $lte: new Date(req.body.end_date)
  //    }});
  //    var total_order_amount = 0;
  //    order_count.forEach(element => {

  //    total_order_amount = total_order_amount + element.order_final_amount;
  //     });

  //    let datas = {

  //      customer_count : user_count.length,
  //      no_of_agent : agent_count.length,
  //      total_order_amount : total_order_amount,
  //      order_count : order_count.length,

  //    }
  //    res.json({ Status: "Success", Message: "Dashboard Details", Data: datas, Code: 200 });
  // });





  router.post('/phone-verification', async (req, res) =>{
  try{
    let phone = await userdetailsModel.findOne({ user_phone: req.body.user_phone, delete_status: false });

    if (phone == null){
    let random = Math.floor(100000 + Math.random()*900000);
    const message = `Dear ${req.body.first_name}, your login One Time Password is ${random}.-We Know How To Choose Fresh Fish`;;
    global.send_sms(req.body.user_phone, message,"1607100000000220483").then(response=>{
      res.json({ Status: "Success", Data: random,user_phone:req.body.user_phone, Code: 200 });
    }).catch(err=>{
      res.status(500).send(err);
    });
  }
  else{
    res.status(400).json({Status:"Fail",Message:"User/Mobile number already exist"});
  }
  }
  catch (ex){
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});


    router.post('/mobile/login', async function (req, res) {
      let userdetails = await userdetailsModel.findOne({ user_phone: req.body.user_phone, delete_status: false });
      if (userdetails == null) {
        res.json({ Status: "Failed", Message: "Invalid Account", Data: {}, Code: 404 });
      } else if(userdetails.user_status !== "complete"){
        res.json({ Status: "Failed", Message: "Invalid Account", Data: {}, Code: 400 });
      }else if(userdetails.user_type ==3){
        const updatedetails = await userdetailsModel.findOne({ _id: userdetails._id });
        res.json({ Status: "Success",Message:"Agent Loggedin Successfully",Data:{ user_details: updatedetails }, Code: 200 });
      } else {
        let random = Math.floor(100000 + Math.random() * 900000);
        const updatedetails = await userdetailsModel.findByIdAndUpdate({ _id: userdetails._id }, { otp: random }, { new: true });
  
        const message = `Dear ${updatedetails.first_name}, your login One Time Password is ${random}.-We Know How To Choose Fresh Fish`;;
        global.send_sms(req.body.user_phone, message,"1607100000000220483").then(response=>{
          res.json({ Status: "Success", Message: "OTP Sent to Your Mobile No", Data: { user_details: updatedetails }, Code: 200 });
        }).catch(err=>{
          res.status(500).send(err);
        });
      }
    });



///////////////////

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


  module.exports = router;
