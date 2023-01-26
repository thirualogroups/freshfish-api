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
    console.log("Value 1",fav_lists);
    if(fav_lists == null){
      fav_listModel.create({user_id: req.body.user_id,product_details_id:req.body.product_details_id,fav_status:true}, function (err, user) {
        if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
        res.json({ Status: "Success", Message: "new Fav added successfully", Data: user, Code: 200 });
      });
    } else {
      fav_listModel.findByIdAndUpdate(fav_lists._id, { fav_status:req.body.fav_status },{new:true}, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "true added successfully", Data: UpdatedDetails, Code: 200 });
      });
    }

 }
 catch (e) {
  console.log(e);
  res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
 }
});



router.get('/mobile/get_favlist', async function (req, res) {
  let params = {user_id:req.query.user_id,fav_status:true};
  let fav_list= await fav_listModel.find(params).populate('product_details_id');
  var stock_list=[];
  for(let item of fav_list){  
  let stock_params = {store:new mongoose.Types.ObjectId(req.query.store),fish_combo_id: new mongoose.Types.ObjectId(item.product_details_id.fish_combo_id), status: true, delete_status: false, soldout: false };
  console.log("stock_params",stock_params);
  let stock = await stockModel.findOne(stock_params);
  console.log("stock details",stock);

  stock_list.push(stock);
  }
  res.json({ Status: "Success", Message: "Your Fav_list Details", Data: stock_list, Code: 200 });
});






router.post('/mobile/cart/create', async function (req, res){
  try {
  if((req.body.user_id !== "") && (req.body.product_details_id !== "") && req.body.user_id && req.body.product_details_id){
  const cart_details = await cart_detailsModel.findOne({product_details_id: new mongoose.Types.ObjectId(req.body.product_details_id),user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false});
    console.log(cart_details);
    if(cart_details == null){
      cart_detailsModel.create({user_id: req.body.user_id,product_details_id:req.body.product_details_id,gross_weight:req.body.gross_weight,customer_info:req.body.customer_info,category:req.body.category,disamount:req.body.disamount,max_net:req.body.max_net,min_net:req.body.min_net,product_price:req.body.product_price,product_quantity:req.body.product_quantity,product_title:req.body.product_title,store:req.body.store,total_amt:req.body.total_amt,unit:req.body.unit,value:req.body.value},
      function (err, user) {
        if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
        res.json({ Status: "Success", Message: "cart product added successfully", Data: user, Code: 200 });
      });
    }else{
      res.status(400).json({ Status: "Failed", Message: "Data Already exist", Code: 400 });
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
  try {
     if(req.body._id!=="" && req.body._id){
  cart_detailsModel.findByIdAndUpdate(req.body._id, req.body, { new: true },
    function (err, user) {
      if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
      res.json({ Status: "Success", Message: "cart product updated successfully", Data: user, Code: 200 });
    });
  }else{
    res.status(400).json({ Status: "Failed", Message: "Data Not Found", Code: 400 });
  }
}catch(e) {
  console.log(e);
  res.json({ Status: "Failed", Message: "Internal Server Error", Data: e, Code: 500 });
 }
});


router.post('/mobile/cart/delete', async function (req, res){
  cart_detailsModel.findByIdAndUpdate(req.body._id,{delete_status:true},
    function (err, user) {
      if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
      res.json({ Status: "Success", Message: "cart product deleted successfully", Data: user, Code: 200 });
    });
});

router.post('/mobile/cart/getlist1', async function (req, res){
  if (req.body.pincode && req.body.pincode !== "") {
    var vendors = await product_vendorModel.find({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true }, { _id: 1, store: 1 });
    if (vendors.length === 0) {
      let a = {
        "recommendation": recommendation,
      }
      res.status(400).json({
        Status: "Failed", Message: "Pincode Not Found", Code: 400
        });
      return;
    }
  let params = { delete_status: false };
    let stock_params = { delete_status: false, status: true, soldout: false, store: { $in: vendors.map(x => x.store) }, gross_weight: { $gte: 0 }, fish_combo_id: {$ne: null} };
    let stocks = await stockModel.find(stock_params, { fish_combo_id: 1, gross_weight: 1, unit: 1, price: 1 });
    let fish_combo_ids = [];
    for (let stock of stocks) {
      fish_combo_ids.push(stock.fish_combo_id);
    }
    params.fish_combo_id = { $in: fish_combo_ids };
    params.store = { $in: vendors.map(x => x.store) };
    params.status=true;
    params.soldout=false;
console.log(params);
    // var product_list = await product_detailsModel.find(params).sort({ _id: -1 }).populate([{ path: "fish_combo_id", select: ["product_name", "code"] }, { path: "cat_id", select: ["product_cate"] }]);
    //   for (let f = 0; f < product_list.length; f++) {

    //         var pro_fav = await Product_favModel.findOne({ user_id: req.body.user_id, product_id: product_list[f]._id, delete_status: false });
    //         var temp_fav = (pro_fav !== null);
    //         var stock = [];
    //         stocks.forEach(element => {
    //         if(""+element.fish_combo_id == ""+product_list[f].fish_combo_id._id){
    //          stock.push(element);
    //         }
    //         });  

    //         let variation_list = [];
    //         product_list[f].variation_list.forEach(element => {
    //         if(element.gross_weight <= stock[0].gross_weight){
    //          variation_list.push(element);
    //         }
    //         }); 
    //      if(variation_list.length !== 0){
             



    //         let k = {
    //           "_id": product_list[f]._id,
    //           "fish_combo_id": product_list[f].fish_combo_id,
    //           "product_img": product_list[f].product_img,
    //           "product_title": product_list[f].fish_combo_id.product_name,
    //           'thumbnail_image': product_list[f].thumbnail_image || 'https://weknowfreshfish.com/api/uploads/Pic_empty.jpg',
    //           "product_price": +product_list[f].cost.toFixed(0),
    //           "product_discount": product_list[f].discount,
    //           "product_discount_price": +product_list[f].discount_amount.toFixed(0) || 0,
    //           "product_fav": temp_fav,
    //           "product_rating": product_list[f].product_rating || 5,
    //           "product_review": product_list[f].product_review || 0,
    //           "product_quantity": 0,
    //           "net_weight": product_list[f].net_weight,
    //           "gross_weight": product_list[f].gross_weight,
    //           "addition_detail": product_list[f].addition_detail,
    //           "discription": product_list[f].product_discription,
    //           "condition": product_list[f].condition,
    //           "unit": product_list[f].unit,
    //           "variation_list": variation_list,
    //           "customer_information": product_list[f].customer_information,
    //           "price_type": product_list[f].price_type,
    //           "stock_gross_weight": stock[0]?.gross_weight,
    //           "stock_unit": stock[0]?.unit,
    //           "stock_price": stock[0]?.price,
    //           "category": product_list[f].cat_id
    //         }
          // }
        // }
  }else{
    res.status(400).json({
     
     Status: "Failed", Message: "Pincode Not Found", Code: 400
 
     });
   }
      });

router.post('/mobile/cart/getlist', async function (req, res){
  const cart_details = await cart_detailsModel.find({user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false}).populate('product_details_id');
  console.log("cart_details",cart_details);
  if(cart_details.length == 0){
    res.json({ Status: "Success", Message: "Your Card Details is Empty", Data: [], Code: 200 });
  }
  var cart_final_value = [];
  for(let a = 0; a < cart_details.length ; a++){ 
  cart_details[a].product_details_id.soldout  = false;
  cart_details[a].product_details_id.related  = "";
  let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(cart_details[a].product_details_id.fish_combo_id), status: true, delete_status: false, soldout: false, store:req.body.store_id };
  let stock = await stockModel.findOne(stock_params);
  console.log(stock);

   if(stock == null){
    cart_details[a].product_details_id.soldout  = true;
    cart_details[a].product_details_id.related  = "Sold Out";
  }else if(stock.soldout == true){
    cart_details[a].product_details_id.soldout  = true;
    cart_details[a].product_details_id.related  = "Sold Out";
  }else if(stock.gross_weight == 0){
    cart_details[a].product_details_id.soldout  = true;
    cart_details[a].product_details_id.related  = "NO Available";
  }else if(stock.gross_weight <= +cart_details[a].gross_weight){
    cart_details[a].product_details_id.soldout  = true;
    cart_details[a].product_details_id.related  = "Stock is less";
  }
  console.log("Stock Value Status",cart_details[a].product_details_id.soldout);
  cart_final_value.push(cart_details[a]);
  if(a == cart_details.length - 1){
    res.json({ Status: "Success", Message: "Your Card Details", Data: cart_final_value, Code: 200 });
  }
 }
});




router.post('/check_checkout_stock',async function (req, res) {
 console.log(req.body)
  var final_value = [];
  for(let a = 0; a < req.body.check_value.length ; a++){ 
  var temp_value = req.body.check_value[a];
  let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(temp_value.fish_combo_id), status: true, delete_status: false, soldout: false, store:temp_value.store };
  let stock = await stockModel.findOne(stock_params);
  console.log(stock);
  var soldout  = false;
  var related  = "";
  if(stock == null){
    soldout  = true;
    related  = "Sold Out";
  }else if(stock.soldout == true){
    soldout  = true;
    related  = "Sold Out";
  }else if(stock.gross_weight == 0){
     soldout  = true;
     related  = "NO Available";
  }else if(stock.gross_weight <= +temp_value.gross_wt){
     soldout  = true;
     related  = "Stock is less";
  }
  console.log(soldout,related);
  req.body.check_value[a].soldout = soldout;
  req.body.check_value[a].related = related;

  final_value.push(req.body.check_value[a]);

   if(a == req.body.check_value.length - 1){
    res.json({ Status: "Success", Message: "Checkout stock value", Data: final_value, Code: 200 });
   }
  }
});











module.exports = router;
