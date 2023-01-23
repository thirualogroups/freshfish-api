const ObjectId = require('mongoose').Types.ObjectId;
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const vendor_banner_detailModel = require('./../models/vendor_banner_detailModel');
const product_categoriesModel = require('./../models/product_categoriesModel');
const product_cart_detailsModel = require('./../models/product_cart_detailsModel');
const product_vendorModel = require('./../models/product_vendorModel');
const product_detailsModel = require('./../models/product_detailsModel');
const stockModel = require("./../models/stockModel");
const mongoose = require('mongoose');
const Product_favModel = require('./../models/Product_favModel');


router.post('/getproductdetails_list', async function (req, res) {
  try {
    var Banner_details = [];
    var test_banner_details = await vendor_banner_detailModel.find({ delete_status: false }).sort({ _id: -1 });
    for (let b = 0; b < test_banner_details.length; b++) {
      Banner_details.push({
        "banner_img": test_banner_details[b].img_path,
        "banner_title": test_banner_details[b].img_title,
      });
    }    
    var product_cate = await product_categoriesModel.find({ delete_status: false, show_status: true }, { createdAt: 0, updatedAt: 0, __v: 0, delete_status: 0 }).sort({ _id: 1 });
    let pincodes_list = [];




    if(req.body.user_id && req.body.user_id !== ""){
      const product_cart_pincodes = await product_cart_detailsModel.find({ delete_status: false, user_id: req.body.user_id, pincode: { $exists: true } }, { pincode: 1 });
      pincodes_list = product_cart_pincodes.filter((item, pos) => product_cart_pincodes.indexOf(item) == pos);
    }
    var today_deals = [];
    var Product_details = [];
    let params = { delete_status: false };
    if (req.body.pincode && req.body.pincode !== "") {
      var vendors = await product_vendorModel.find({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true }, { _id: 1, store: 1 });
      

      if (vendors.length === 0) {
        let a = {
          "Banner_details": Banner_details,
          "Today_Special": today_deals,
          "Product_details": Product_details,
          "product_cate": product_cate,
          "vendors_available": false,
          "cart_pincodes": pincodes_list.length > 0 ? pincodes_list[0]["pincode"] : ""
        }
        res.json({ Status: "Success", Message: "product list", Data: a, Code: 200 });
	      return;
      }
      



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
      




      var product_list = await product_detailsModel.find(params).sort({ _id: -1 }).populate([{ path: "fish_combo_id", select: ["product_name", "code"] }, { path: "cat_id", select: ["product_cate"] }]);
      for (let a = 0; a < product_cate.length; a++) {
        Product_details.push({
          "cat_id": product_cate[a]._id,
          "cat_name": product_cate[a].product_cate,
          "product_list": []
        });
      }


        for (let f = 0; f < product_list.length; f++) {
              var pro_fav = await Product_favModel.findOne({ user_id: req.body.user_id, product_id: product_list[f]._id, delete_status: false });
              var temp_fav = (pro_fav !== null);

                var stock = [];
                 stocks.forEach(element => {
                  // console.log(element);
                 if(""+element.fish_combo_id == ""+product_list[f].fish_combo_id._id){
                  stock.push(element);
                  // console.log(stock);
                 }
                 });  

                 let variation_list = [];
                 product_list[f].variation_list.forEach(element => {
                  // console.log(element.gross_weight,stock[0].gross_weight,product_list[f].fish_combo_id.product_name)
                 if(element.gross_weight <= stock[0].gross_weight){
                  variation_list.push(element);
                  // console.log(stock);
                 }
                 }); 
                 
                 if(variation_list.length == 0){
                   console.log("********",stock[0].gross_weight,product_list[f].fish_combo_id.product_name)
                 }
                
              if(variation_list.length !== 0){

              let k = {
                "_id": product_list[f]._id,
                "fish_combo_id": product_list[f].fish_combo_id,
                "product_img": product_list[f].product_img,
                "product_title": product_list[f].fish_combo_id.product_name,
                'thumbnail_image': product_list[f].thumbnail_image || 'https://weknowfreshfish.com/api/uploads/Pic_empty.jpg',
                "product_price": +product_list[f].cost.toFixed(0),
                "product_discount": product_list[f].discount,
                "product_discount_price": +product_list[f].discount_amount.toFixed(0) || 0,
                "product_fav": temp_fav,
                "product_rating": product_list[f].product_rating || 5,
                "product_review": product_list[f].product_review || 0,
                "product_quantity": 0,
                "net_weight": product_list[f].net_weight,
                "gross_weight": product_list[f].gross_weight,
                "addition_detail": product_list[f].addition_detail,
                "discription": product_list[f].product_discription,
                "condition": product_list[f].condition,
                "unit": product_list[f].unit,
                "variation_list": variation_list,
                "customer_information": product_list[f].customer_information,
                "price_type": product_list[f].price_type,
                "stock_gross_weight": stock[0]?.gross_weight,
                "stock_unit": stock[0]?.unit,
                "stock_price": stock[0]?.price,
                "category": product_list[f].cat_id
              }


              
            if(product_list[f].cat_id){
              Product_details.filter(x=>x.cat_id.toString()==product_list[f].cat_id._id.toString())[0]?.product_list.push(k)
            }
              if (product_list[f].today_deal == true && today_deals.length < 5) {
                today_deals.push(k);
              }

            }


        }
        
    }

    let vendor;
    if (req.body.pincode && req.body.pincode !== "") {
      vendor = await product_vendorModel.findOne({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true, delete_status: false }, { _id: 1, store: 1 });
    }

    res.json({
      Status: "Success", Message: "product list", Data: {
        "Banner_details": Banner_details,
        "Today_Special": today_deals,
        "Product_details": Product_details,
        "product_cate": product_cate,
        "vendor": vendor,
        "vendors_available": true,
        "cart_pincodes": pincodes_list.length > 0 ? pincodes_list[0]["pincode"] : ""
      }, Code: 200
    });
  }
  catch (ex) {
    console.log(ex);
    res.status(500).json({ Status: "Fail", Message: ex.message, Code: 500 });
  }
});
// router.get('/getlist', function (req, res) {
//   product_detailsModel.find({}, function (err, Functiondetails) {
//     res.json({ Status: "Success", Message: "product details", Data: Functiondetails, Code: 200 });
//   });
// });


router.get('/getlist', function (req, res) {
  let params = { delete_status: false };
  if (req.query.status) {
    params.status = req.query.status;
  }

  if (req.query.cat_id && req.query.cat_id != "") {
    params.cat_id = req.query.cat_id;
  }
  if (req.query.user_id && req.query.user_id != "") {
    params.user_id = req.query.user_id;
  }
  if (req.query.fish_combo_id && req.query.fish_combo_id != "") {
    params.fish_combo_id = req.query.fish_combo_id;
  }
  if (req.query.store) {
    params.store = req.query.store;
  }
  product_detailsModel.find(params, function (err, list) {
    if (err) return res.json({ Status: "Fail", Message: err.message, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen  Details", Data: list, Code: 200 });
  }).populate('cat_id user_id fish_combo_id store');
});

router.post('/edit', function (req, res) {
  product_detailsModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Message: err.message, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen  Updated", Data: UpdatedDetails, Code: 200 });
  });
});


// // DELETES A USER FROM THE DATABASE


router.post('/delete', function (req, res) {
  let c = {
    delete_status: true
  }
  product_detailsModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "product Details Deleted successfully", Data: UpdatedDetails, Code: 200 });
  });
});

router.post('/mobile/product_list', async function (req, res) {

  var product_cate = await product_categoriesModel.find({ delete_status: false, show_status: true }, { createdAt: 0, updatedAt: 0, __v: 0, delete_status: 0 }).sort({ _id: 1 });
  var Product_details = [];
  let params ={cat_id:req.body.cat_id};
  if (req.body.pincode && req.body.pincode !== "") {
    var vendors = await product_vendorModel.find({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true }, { _id: 1, store: 1 });
    if (vendors.length === 0) {
      let a = {
        "Product_details": Product_details,
      }
      res.status(400).json({ Status: "Failed", Message: "Request Failed", Code: 400});
      return;
    }
    let stock_params = { delete_status: false, status: true, soldout: false, store: { $in: vendors.map(x => x.store) }, gross_weight: { $gte: 0 }, fish_combo_id: {$ne: null} };
    let stocks = await stockModel.find(stock_params, { fish_combo_id: 1, gross_weight: 1, unit: 1, price: 1 });
    let fish_combo_ids = [];
    for (let stock of stocks) {
      fish_combo_ids.push(stock.fish_combo_id);
    }
    params.fish_combo_id = { $in: fish_combo_ids };
    params.store = { $in: vendors.map(x => x.store) };
    params.delete_status=false;
    params.status=true;
    params.soldout=false;

    var product_list = await product_detailsModel.find(params).sort({ _id: -1 }).populate([{ path: "fish_combo_id", select: ["product_name", "code"] }, { path: "cat_id", select: ["product_cate"] }]);
      for (let f = 0; f < product_list.length; f++) {
            var pro_fav = await Product_favModel.findOne({ user_id: req.body.user_id, product_id: product_list[f]._id, delete_status: false });
            
            console.log("Fav list",pro_fav);

            var temp_fav = (pro_fav !== null);
            // const stock = stocks.filter(x => x.fish_combo_id === product_list[f].fish_combo_id._id);
            // let variation_list = product_list[f].variation_list.filter(x => x.gross_weight <= stock[0]?.gross_weight);
            // const stock = stocks.filter(x => x.fish_combo_id === product_list[f].fish_combo_id._id);
            // let variation_list = product_list[f].variation_list;
            var stock = [];
            stocks.forEach(element => {
             // console.log(element);
            if(""+element.fish_combo_id == ""+product_list[f].fish_combo_id._id){
             stock.push(element);
             // console.log(stock);
            }
            });  

            let variation_list = [];
            product_list[f].variation_list.forEach(element => {
             // console.log(element.gross_weight,stock[0].gross_weight,product_list[f].fish_combo_id.product_name)
            if(element.gross_weight <= stock[0].gross_weight){
             variation_list.push(element);
             // console.log(stock);
            }
            }); 
            
            if(variation_list.length == 0){
              console.log("********",stock[0].gross_weight,product_list[f].fish_combo_id.product_name)
            }
           
         if(variation_list.length !== 0){
            let k = {
              "_id": product_list[f]._id,
              "fish_combo_id": product_list[f].fish_combo_id,
              "product_img": product_list[f].product_img,
              "product_title": product_list[f].fish_combo_id.product_name,
              'thumbnail_image': product_list[f].thumbnail_image || 'https://weknowfreshfish.com/api/uploads/Pic_empty.jpg',
              "product_price": +product_list[f].cost.toFixed(0),
              "product_discount": product_list[f].discount,
              "product_discount_price": +product_list[f].discount_amount.toFixed(0) || 0,
              "product_fav": temp_fav,
              "product_rating": product_list[f].product_rating || 5,
              "product_review": product_list[f].product_review || 0,
              "product_quantity": 0,
              "net_weight": product_list[f].net_weight,
              "gross_weight": product_list[f].gross_weight,
              "addition_detail": product_list[f].addition_detail,
              "discription": product_list[f].product_discription,
              "condition": product_list[f].condition,
              "unit": product_list[f].unit,
              "variation_list": variation_list,
              "customer_information": product_list[f].customer_information,
              "price_type": product_list[f].price_type,
              "stock_gross_weight": stock[0]?.gross_weight,
              "stock_unit": stock[0]?.unit,
              "stock_price": stock[0]?.price,
              "category": product_list[f].cat_id
            }
            if(product_list[f].cat_id){
            Product_details.filter(x=>x.cat_id.toString()==product_list[f].cat_id._id.toString())[0]?.product_list.push(k)
            }
          }
      }
      if(product_list.length !== 0){
        let vendor;
    if (req.body.pincode && req.body.pincode !== "") {
      vendor = await product_vendorModel.findOne({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true, delete_status: false }, { _id: 1, store: 1 });
    }
      res.json({
        Status: "Success", Message: "Product_details List", 
        Data: {
          "Product_details": product_list,
          "vendor":vendor
      }, Code: 200
      });
    }else{
      res.status(400).json({ Status: "Product Request Failed", Code: 400 });
     
    }
   }else{
    res.status(400).json({ Status: "Pincode Request Failed", Code: 400 });
    
   }
 
});
router.get('/mobile/banner', async function (req, res) {
try{
  var Banner_details = [];
    var test_banner_details = await vendor_banner_detailModel.find({ delete_status: false }).sort({ _id: -1 });
    for (let b = 0; b < test_banner_details.length; b++) {
      Banner_details.push({
        "banner_img": test_banner_details[b].img_path,
        "banner_title": test_banner_details[b].img_title,
      });
    }
    res.json({
      Status: "Success", Message: "Banner Details List", Data: {"Banner_details": Banner_details}, Code: 200
    });
  }catch(err){

 res.send(400).json({Status: "Failed", Message: err, Code: 400});
  }
});
router.post('/mobile/product_cate', async function (req, res) {
  
  if (req.body.pincode && req.body.pincode !== "") {
    const product_cate = await product_categoriesModel.find({ delete_status: false, show_status: true }, { createdAt: 0, updatedAt: 0, __v: 0, delete_status: 0 }).sort({ _id: 1 }).then(list => {
    res.json({ Status: "Success", Message: "Product Categories List", Data: list, Code: 200 });
  }).catch(error => {
    res.json({ Status: "Fail", Message: "Product Categories List", Data: error.message, Code: 500 });
  });
  }

});


// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
  product_detailsModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Vendor Deleted successfully", Data: {}, Code: 200 });
  });
});


router.get('/getlist', function (req, res) {
    product_detailsModel.find({}, function (err, StateList) {
        res.json({ Status: "Success", Message: "Vendor List", Data: StateList, Code: 200 });
    });
});




router.get('/getlist_product_vendor', function (req, res) {
    product_vendorModel.find({}, function (err, StateList) {
        res.json({ Status: "Success", Message: "Vendor List", Data: StateList, Code: 200 });
    });
});








router.post('/mobile/recommendation', async function (req, res) {

  var recommendation = [];
  var Product_details = [];
  let params = { delete_status: false };
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

    var product_list = await product_detailsModel.find(params).sort({ _id: -1 }).populate([{ path: "fish_combo_id", select: ["product_name", "code"] }, { path: "cat_id", select: ["product_cate"] }]);
      for (let f = 0; f < product_list.length; f++) {

            var pro_fav = await Product_favModel.findOne({ user_id: req.body.user_id, product_id: product_list[f]._id, delete_status: false });
            var temp_fav = (pro_fav !== null);
            var stock = [];
            stocks.forEach(element => {
            if(""+element.fish_combo_id == ""+product_list[f].fish_combo_id._id){
             stock.push(element);
            }
            });  

            let variation_list = [];
            product_list[f].variation_list.forEach(element => {
            if(element.gross_weight <= stock[0].gross_weight){
             variation_list.push(element);
            }
            }); 
         if(variation_list.length !== 0){
             



            let k = {
              "_id": product_list[f]._id,
              "fish_combo_id": product_list[f].fish_combo_id,
              "product_img": product_list[f].product_img,
              "product_title": product_list[f].fish_combo_id.product_name,
              'thumbnail_image': product_list[f].thumbnail_image || 'https://weknowfreshfish.com/api/uploads/Pic_empty.jpg',
              "product_price": +product_list[f].cost.toFixed(0),
              "product_discount": product_list[f].discount,
              "product_discount_price": +product_list[f].discount_amount.toFixed(0) || 0,
              "product_fav": temp_fav,
              "product_rating": product_list[f].product_rating || 5,
              "product_review": product_list[f].product_review || 0,
              "product_quantity": 0,
              "net_weight": product_list[f].net_weight,
              "gross_weight": product_list[f].gross_weight,
              "addition_detail": product_list[f].addition_detail,
              "discription": product_list[f].product_discription,
              "condition": product_list[f].condition,
              "unit": product_list[f].unit,
              "variation_list": variation_list,
              "customer_information": product_list[f].customer_information,
              "price_type": product_list[f].price_type,
              "stock_gross_weight": stock[0]?.gross_weight,
              "stock_unit": stock[0]?.unit,
              "stock_price": stock[0]?.price,
              "category": product_list[f].cat_id
            }

            if(product_list[f].cat_id){
              Product_details.filter(x=>x.cat_id.toString()==product_list[f].cat_id._id.toString())[0]?.product_list.push(k)
            }
            if (product_list[f].recommendation == true && recommendation.length < 5) {
              recommendation.push(k);
            }
          }
            if(f == product_list.length - 1){

              let vendor;
    if (req.body.pincode && req.body.pincode !== "") {
      vendor = await product_vendorModel.findOne({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true, delete_status: false }, { _id: 1, store: 1 });
    }
               if(recommendation.length == 0){
                res.status(400).json({
              Status: "Failed", Message: "No Data Found", Data: {"Recommented": recommendation}, Code: 400
              });
               }else {
                res.json({
              Status: "Success", Message: "Recommendation List", Data: {"Recommented": recommendation,"vendor":vendor}, Code: 200
              });
               }
            }
      }
   }else{
   res.status(400).json({
    
    Status: "Failed", Message: "Pincode Not Found", Code: 400

    });
  }
    });
module.exports = router;
