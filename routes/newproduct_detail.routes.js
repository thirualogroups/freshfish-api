var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var newproduct_detailModel = require('./../models/newproduct_detailModel');
var product_detailsModel = require('./../models/product_detailsModel');
const storesModel = require('./../models/storesModel');
const stockModel = require("./../models/stockModel");
const fav_listModel=require("./../models/fav_listModel");
const cart_detailsModel = require('../models/cart_detailsModel');



////////////////// Admin User /////////////////////////

router.post('/vendor_product_create', async function (req, res) {
  // var new_product_detail = await newproduct_detailModel.findOne({_id: req.body._id});
  // console.log(new_product_detail);
  req.body.cost = +req.body.cost;
  const stores = await storesModel.find({delete_status:false});
  const stocks = await stockModel.findOne({fish_combo_id: new mongoose.Types.ObjectId(req.body.fish_combo_id),store:new mongoose.Types.ObjectId(req.body.store)});
  
  try {
    if(req.body.fish_combo_id==null) throw "fish_combo_id cannot be null";
    let price = stocks?.price || 0; price = (price == null) ? 0 : price;
    let params = [];
    for(const store of stores){
     params.push({
      user_id: req.body.vendor_id,
      cat_id: req.body.cat_id,
      thumbnail_image: req.body.thumbnail_image,
      product_img: req.body.product_img || [],
      fish_combo_id: req.body.fish_combo_id,
      store: store._id,
      cost: stocks?.price || 0,
      product_discription: req.body.product_discription || "",
      condition: req.body.condition || "",
      price_type: req.body.price_type,
      variation: req.body.variation,
      addition_detail: req.body.addition_detail || "",
      date_and_time: req.body.date_and_time || "",
      mobile_type: req.body.mobile_type || "",
      related: "",
      count: 0,
      status: "true",
      verification_status: "Not Verified",
      delete_status: false,
      fav_status: false,
      today_deal: false,
      discount: req.body.discount,
      discount_amount: req.body.discount_amount,
      discount_status: false,
      discount_cal: 0,
      discount_start_date: "",
      discount_end_date: "",
      product_rating: 5,
      product_review: 0,
      gross_weight: req.body.gross_weight,
      min_net_weight: req.body.min_net_weight,
      max_net_weight: req.body.max_net_weight,
      unit: stocks?.unit || "kg",
      customer_information: req.body.customer_information
    });
  }
    product_detailsModel.create(params,
      function (err, user) {
        console.log(user)
        console.log(err);
        console.log("Product_details***********1", user);
        if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
        res.json({ Status: "Success", Message: "product details added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    console.log(e);
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});

router.get('/getlist', function (req, res) {
  newproduct_detailModel.find({}, function (err, Functiondetails) {
    res.json({ Status: "Success", Message: "product details screen  Details", Data: Functiondetails, Code: 200 });
  }).populate('cat_id sub_cat_id cat_type fish_type');
});




router.post('/delete', function (req, res) {
  let c = {
    delete_status: true
  }
  newproduct_detailModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Location Deleted successfully", Data: UpdatedDetails, Code: 200 });
  });
});

router.get('/deletes', function (req, res) {
  newproduct_detailModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "Details Deleted", Data: {}, Code: 200 });
  });
});


router.post('/edit', function (req, res) {
  product_detailsModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen  Updated", Data: UpdatedDetails, Code: 200 });
  });
});

// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
  newproduct_detailModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen Deleted successfully", Data: {}, Code: 200 });
  });
});


////////////////////////////////////////////////////////////////////////
router.post('/mobile/favlist', async function (req, res) {
  const fav_lists = await fav_listModel.findOne({product_details_id: new mongoose.Types.ObjectId(req.body.product_details_id),user_id: new mongoose.Types.ObjectId(req.body.user_id)});
  try {
    if(fav_lists== null){
      fav_listModel.create({user_id: req.body.user_id,product_details_id:req.body.product_details_id,fav_status:true},
      function (err, user) {
        if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
        res.json({ Status: "Success", Message: "new Fav added successfully", Data: user, Code: 200 });
      });
    }else{
      if(req.body.fav_status==true){

        fav_listModel.findByIdAndUpdate(fav_lists._id,{fav_status:req.body.fav_status},
          function (err, user) {
            if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
            res.json({ Status: "Success", Message: "true added successfully", Data: user, Code: 200 });
          });
  
  
      }else{
        fav_listModel.findByIdAndUpdate(fav_lists._id,{fav_status:req.body.fav_status},
          function (err, user) {
            if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
            res.json({ Status: "Success", Message: "False removed successfully", Data: user, Code: 200 });
          });
  
      }
    }

 }
 catch (e) {
  console.log(e);
  res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
 }

});

router.get('/mobile/get_favlist', async function (req, res) {
  let params = {user_id:req.body.user_id,fav_status:true};
  let fav_list= await fav_listModel.find(params);
  console.log("favvvvvvvvvvvvvv",fav_list);
var productslist=[];
for(let item of fav_list){
let product_params ={_id: new mongoose.Types.ObjectId(item.product_details_id), status: true, delete_status: false }
var product_details= await product_detailsModel.findOne(product_params);
productslist.push(product_details);
  }
 console.log(productslist);

  var stock_list=[];
  for(let item of productslist){
    let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(item.fish_combo_id), status: true, delete_status: false, soldout: false };
    console.log(stock_params);
     let stock = await stockModel.findOne(stock_params);
     stock_list.push(stock);
    //, function (err, list) {
    //   if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: err.message, Code: 500 });
    //   res.json({ Status: "Success", Message: "Your Fav_list Details", Data: list, Code: 200 });
    // });
  }
console.log(stock_list);
});

router.post('/mobile/cart/create', async function (req, res){
  try {
    if((req.body.user_id!=="") && (req.body.product_details_id!=="") && req.body.user_id && req.body.product_details_id){
  const cart_details = await cart_detailsModel.findOne({product_details_id: new mongoose.Types.ObjectId(req.body.product_details_id),user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false});
    if(cart_details== null){
      cart_detailsModel.create({user_id: req.body.user_id,product_details_id:req.body.product_details_id,gross_weight:req.body.gross_weight,customer_info:req.body.customer_info},
      function (err, user) {
        if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
        res.json({ Status: "Success", Message: "cart product added successfully", Data: user, Code: 200 });
      });
    }
  }else{
    res.status(400).json({ Status: "Failed", Message: "Data Not Found", Code: 400 });
  }
    }catch(e) {
     console.log(e);
     res.json({ Status: "Failed", Message: "Internal Server Error", Data: e, Code: 500 });
    }
});

router.post('/mobile/cart/update', async function (req, res){
  const cart_details = await cart_detailsModel.findOne({product_details_id: new mongoose.Types.ObjectId(req.body.product_details_id),user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false});

  cart_detailsModel.findByIdAndUpdate(cart_details._id,{gross_weight:req.body.gross_weight,customer_info:req.body.customer_info},
    function (err, user) {
      if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
      res.json({ Status: "Success", Message: "cart product updated successfully", Data: user, Code: 200 });
    });
});

router.post('/mobile/cart/delete', async function (req, res){
  cart_detailsModel.findByIdAndUpdate(req.body._id,{delete_status:true},
    function (err, user) {
      if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
      res.json({ Status: "Success", Message: "cart product deleted successfully", Data: user, Code: 200 });
    });
});
// router.get('/mobile/cart/getlist', async function (req, res){
//   const cart_details = await cart_detailsModel.find({product_details_id: new mongoose.Types.ObjectId(req.body.product_details_id),user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false});

//   cart_detailsModel.findByIdAndUpdate(cart_details._id,{gross_weight:req.body.gross_weight,customer_info:req.body.customer_info},
//     function (err, user) {
//       if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
//       res.json({ Status: "Success", Message: "cart product updated successfully", Data: user, Code: 200 });
//     });
// });

module.exports = router;
