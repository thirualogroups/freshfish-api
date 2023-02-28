var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
var moment = require('moment-timezone');




router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


var userdetailsModel = require('./../models/userdetailsModel');
var product_vendorModel = require('./../models/product_vendorModel');
var locationdetailsModel = require('./../models/locationdetailsModel');
var counterMasterModel = require("../models/counterModel");
var userdetailsModel = require('./../models/userdetailsModel');





////// Admin User //////////////


router.post('/create', async function (req, res) {
  try {
    if (req.body._default && (req.body._default === "true" || req.body._default === true)) {
      await product_vendorModel.updateMany({ _default: true }, { _default: false });
    }
    const counter = await counterMasterModel.findByIdAndUpdate({ _id: 'agent' }, { $inc: { seq: 1 } });
    await product_vendorModel.create({
      user_id: req.body.user_id,
      user_name: req.body.user_name,
      user_email: req.body.user_email,
      bussiness_name: req.body.bussiness_name,
      bussiness_email: req.body.bussiness_email,
      bussiness: req.body.bussiness,
      bussiness_phone: req.body.bussiness_phone,
      business_reg: req.body.business_reg,
      bussiness_gallery: req.body.bussiness_gallery,
      photo_id_proof: req.body.photo_id_proof,
      govt_id_proof: req.body.govt_id_proof,
      certifi: req.body.certifi,
      date_and_time: req.body.date_and_time,
      mobile_type: req.body.mobile_type,
      profile_status: req.body.profile_status,
      profile_verification_status: req.body.profile_verification_status,
      bussiness_loc: req.body.bussiness_loc,
      bussiness_lat: req.body.bussiness_lat,
      bussiness_long: req.body.bussiness_long,
      bussiness_pincodes: req.body.bussiness_pincodes,
      delete_status: false,
      pincodes: req.body.pincodes,
      store: req.body.store,
      code: counter.seq.toString().padStart(4, '0'),
      status: req.body.status,
      _default: req.body._default,
      delivery_slots: req.body.delivery_slots
    },
      function (err, user) {
        if (err) res.json({ Status: "Fail", Message: err.message, Code: 400 });
        else res.json({ Status: "Success", Message: "Vendor Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});


router.get('/getlist', function (req, res) {
   let params = { delete_status: false };
  // let params = {};
  if (req.query.store) {
    params.store = new mongoose.Types.ObjectId(req.query.store);
  }
  product_vendorModel.find(params, {__v: 0 }, function (err, list) {
    if (err) return res.status(500).send("There was a problem in listing the vendors.");
      var final_value = [];
      list.forEach(element => {
      if(element.store !== null){
         final_value.push(element);
            }
      });
    res.json({ Status: "Success", Message: "Vendor Details", Data: final_value, Code: 200 });
  }).populate([{ path: 'user_id', select: { first_name: 1, last_name: 1, user_email: 1, user_phone: 1,user_type: 1} }, { path: 'store', select: { name: 1, code: 1 }}]);
});

  // }).populate([{ path: 'user_id', select: { first_name: 1, last_name: 1, user_email: 1, user_phone: 1 } }, { path: 'store', select: { name: 1, code: 1 }, match: { status: true } }]);


router.get('/getlist_list', function (req, res) {
  product_vendorModel.find({}, function (err, Functiondetails) {
    res.json({ Status: "Success", Message: "Vendor Details", Data: Functiondetails, Code: 200 });
  }).populate('user_id');
});

router.get('/deletes', function (req, res) {
  product_vendorModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "Vendor type Deleted", Data: {}, Code: 200 });
  });
});

router.post('/getlist_pincodes', function (req, res) {
  let params = { delete_status: false };
  if (req.body.search) {
    params["pincodes"] = new RegExp(".*" + req.body.search + ".*");
  }
  product_vendorModel.find(params, { pincodes: 1 }, function (err, list) {
    let pincodes = [];
    for (let a of list)
      for (let b of a["pincodes"])
        if (pincodes.indexOf(b) == -1) pincodes.push(b);
    res.json({ Status: "Success", Message: "Vendor Details", Data: pincodes, Code: 200 });
  });
});

router.post('/edit',async function (req, res) {
  if (req.body._default && (req.body._default === "true" || req.body._default === true)) {
    await product_vendorModel.updateMany({ _default: true }, { _default: false });
  }
  product_vendorModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Vendor Updated", Data: UpdatedDetails, Code: 200 });
  });
});



router.post('/delete',async function (req, res) {
  const vendor_detail = await product_vendorModel.findOne({_id: req.body._id});
  console.log(vendor_detail.user_id);
  let phone = await userdetailsModel.findOne({_id:vendor_detail.user_id});
  console.log(phone);

  userdetailsModel.findByIdAndUpdate(phone._id, { user_phone: phone.user_phone+"0"}, { new: true }, function (err, UpdatedDetails) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
       res.json({ Status: "Success", Message: "User Details Updated", Data: UpdatedDetails, Code: 200 });
    });



  let c = {
    delete_status: true
  }
  product_vendorModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Location Deleted successfully", Data: UpdatedDetails, Code: 200 });
  });
});

// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
  product_vendorModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Vendor Deleted successfully", Data: {}, Code: 200 });
  });
});


////// ////// ////// ////// ////// 





///////////// Web site //////////////////

router.post('/getlist_pincodes', function (req, res) {
  let params = { delete_status: false };
  if (req.body.search) {
    params["pincodes"] = new RegExp(".*" + req.body.search + ".*");
  }
  product_vendorModel.find(params, { pincodes: 1 }, function (err, list) {
    let pincodes = [];
    for (let a of list)
      for (let b of a["pincodes"])
        if (pincodes.indexOf(b) == -1) pincodes.push(b);
    res.json({ Status: "Success", Message: "Vendor Details", Data: pincodes, Code: 200 });
  });
});


router.get("/pincodes", (req, res) => {
  product_vendorModel.find({ delete_status: false ,status:true}, { pincodes: 1 }, function (err, list) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Vendor Deleted successfully", Data: list.reduce((x, y) => (x.push(...y["pincodes"]), x), []), Code: 200 });
  });
});


router.get("/pincodes_web", (req, res) => {
  product_vendorModel.find({ delete_status: false}, { pincodes: 1 }, function (err, list) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Vendor Deleted successfully", Data: list.reduce((x, y) => (x.push(...y["pincodes"]), x), []), Code: 200 });
  });
});



// router.post("/pincodes_active", (req, res) => {
//   product_vendorModel.findOne({  delete_status: false ,status:true}, { pincodes: 1 }, function (err, list) {
//     if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
//     res.json({ Status: "Success", Message: "Vendor Deleted successfully", Data: list.reduce((x, y) => (x.push(...y["pincodes"]), x), []), Code: 200 });
//   });
// });


router.post('/pincodes_activeornot', async function (req, res) {
    product_vendorModel.find({  delete_status: false ,status:true}, { pincodes: 1 }, function (err, list) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    var list_details = list.reduce((x, y) => (x.push(...y["pincodes"]), x), []);
    console.log(list_details);
    var status = false;
   list_details.forEach(element => {
   console.log(element);
   if(element == req.body.pincode){
    status = true;
   }
   });
   if(status == true){
    res.json({ Status: status, Message: "Pincode available", Data: {}, Code: 200 });
   } else {
     res.json({ Status: status, Message: "Pincode Not Available", Data: {}, Code: 404 });
   } 
  });
});



router.get("/delivery_slots/:agentid", (req, res) => {
  try {
    product_vendorModel.findById(req.params.agentid, (err, rec) => {
      if (err) return res.json({ Status: "Failed", Message: err.message, Code: 500 });
      let agent = rec.toJSON();
      let delivery_slots = [];
      for (let slot of agent.delivery_slots) {
        let days = [{ day: "Sunday", date: null }, { day: "Monday", date: null }, { day: "Tuesday", date: null }, { day: "Wednesday", date: null }, { day: "Thursday", date: null }, { day: "Friday", date: null }, { day: "Saturday", date: null }];
        let curdate = new Date(moment().tz("Asia/Kolkata").format("YYYY/MM/DD HH:mm"));
        let delivery_start_time = new Date(moment().tz("Asia/Kolkata").format("YYYY/MM/DD " + slot.delivery_start_time));
        let hours = parseInt(slot.order_ends_before.substring(0, 2));
        let mins = parseInt(slot.order_ends_before.substring(3, 5));
        let order_end_time = new Date(delivery_start_time.setHours(hours));
        order_end_time = new Date(order_end_time.setMinutes(mins));
        if (order_end_time <= curdate) {
          curdate = new Date(new Date().setDate(curdate.getDate() + 1));
        }
        let curday = curdate.getDay();
        let date1 = curdate.getDate();
        let j = 0;
        for (let i = curday; i < days.length; i++, j++) {
          days[i].date = moment(curdate.setDate(date1 + j)).tz("Asia/Kolkata").format("YYYY-MM-DD");
          days[i].delivery_start_time = slot.delivery_start_time;
          days[i].delivery_end_time = slot.delivery_end_time;
        }
        for (let i = 0; i < curday; i++, j++) {
          days[i].date = moment(curdate.setDate(date1 + j)).tz("Asia/Kolkata").format("YYYY-MM-DD");
          days[i].delivery_start_time = slot.delivery_start_time;
          days[i].delivery_end_time = slot.delivery_end_time;
        }
        let today_date = moment(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD");
        let tomorrow_date = moment(new Date(new Date().setDate(new Date().getDate() + 1))).tz("Asia/Kolkata").format("YYYY-MM-DD");
        for (let day1 of slot.delivery_days) {
          let delivery_day = days.filter(x => x.day === day1)[0];
          if(delivery_day?.date === today_date || delivery_day?.date === tomorrow_date)
            delivery_slots.push({ date: delivery_day?.date, start_time: delivery_day?.delivery_start_time, end_time: delivery_day?.delivery_end_time, text: delivery_day?.date === today_date ? "Today":"Tomorrow"  });
        }
        delivery_slots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      }
      res.json({Status: "Success", Data:delivery_slots, Code: 200});
    });
  }
  catch (ex) {
    if (err) return res.json({ Status: "Failed", Message: ex.message, Code: 500 });
  }
});


router.post('/mobile/slot-alert',async function (req, res) {

  let shipping_params={ default_status : true,delete_status : false};   
  let default_add= await shipping_addressModel.find(shipping_params);
  let default_user=[];
  let vendorlist=[];
  let user_details=[];
  let delivery_slots=[];
  for(i=0; i < default_add.length; i++){
    var customer = default_add[i].user_id;
    default_user.push(customer);

    let pincode_params={user_id:default_user[i]};
    let default_pincodes= await shipping_addressModel.findOne(pincode_params);
    let vendor = await product_vendorModel.findOne({ pincodes: { $elemMatch: { $eq: default_pincodes.pincode } }, status: true, delete_status: false });
    if(vendor !== null){
    let vendor1=vendor.toJSON();
    for(let slot of vendor1.delivery_slots){
      let days = [{ day: "Sunday", date: null }, { day: "Monday", date: null }, { day: "Tuesday", date: null }, { day: "Wednesday", date: null }, { day: "Thursday", date: null }, { day: "Friday", date: null }, { day: "Saturday", date: null }];
      let today_date =new Date().tz("Asia/Kolkata").format("YYYY-MM-DD");
      let tomorrow_date = new Date(new Date().setDate(new Date().getDate() + 1)).tz("Asia/Kolkata").format("YYYY-MM-DD");
      for (let day1 of slot.delivery_days) {
        let delivery_day = days.filter(x => x.day === day1)[1];
        if(delivery_day?.date === today_date || delivery_day?.date === tomorrow_date ){
          console.log("delivery date",delivery_day?.date);
        }

      }
    }
    }
  }
  
  

});



module.exports = router;
