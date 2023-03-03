var express = require('express');
const moment = require('moment');
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
const product_vendorModel = require('./../models/product_vendorModel');
const userdetailsModel=require('./../models/userdetailsModel');
var admin= require("firebase-admin");
var fcm =require("fcm-notification");

var admin = require("firebase-admin");

var serviceAccount = require("../config/push-notification-key.json");
//var serviceAccount = require("../config/push-notification-key.json");
const shipping_addressModel = require('../models/shipping_addressModel');
const certpath =admin.credential.cert(serviceAccount);
var FCM = new fcm(certpath);


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
  console.log("favlist",fav_list);
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

router.post('/mobile/cart/getlist', async function (req, res){

  const cart_details = await cart_detailsModel.find({user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false}).populate('product_details_id');
  
  if(cart_details.length == 0){
    res.json({ Status: "Success", Message: "Your Card Details is Empty", Data: [], Code: 200 });
  }
  var cart_final_value = [];
  for(let a = 0; a < cart_details.length ; a++){ 
  cart_details[a].product_details_id.soldout  = false;
  cart_details[a].product_details_id.related  = "";
  let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(cart_details[a].product_details_id.fish_combo_id), status: true, delete_status: false, soldout: false, store:req.body.store_id };
  let stock = await stockModel.findOne(stock_params);
  console.log("stock",stock);

  if(stock !== null){
            let variation_list = [];
            cart_details[a].product_details_id.variation_list.forEach(element => {
            if(element.gross_weight <= stock.gross_weight){
            variation_list.push(element);
            }
            });
             console.log("variation",variation_list);

            if(variation_list.length !== 0){
              cart_details[a].variation_list = variation_list;
            }
          }else if(stock == null){
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
            //console.log("Stock Value Status",cart_details[a].product_details_id.variation_list);
            cart_final_value.push(cart_details[a]);
            if(a == cart_details.length - 1){
              res.json({ Status: "Success", Message: "Your Card Details", Data: cart_final_value, Code: 200 });
            }
}


      });

// router.post('/mobile/cart/getlist', async function (req, res){
//   const cart_details = await cart_detailsModel.find({user_id: new mongoose.Types.ObjectId(req.body.user_id),delete_status:false}).populate('product_details_id');
//   console.log("cart_details",cart_details);
//   if(cart_details.length == 0){
//     res.json({ Status: "Success", Message: "Your Card Details is Empty", Data: [], Code: 200 });
//   }
//   var cart_final_value = [];
//   for(let a = 0; a < cart_details.length ; a++){ 
//   cart_details[a].product_details_id.soldout  = false;
//   cart_details[a].product_details_id.related  = "";
//   let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(cart_details[a].product_details_id.fish_combo_id), status: true, delete_status: false, soldout: false, store:req.body.store_id };
//   let stock = await stockModel.findOne(stock_params);
//   console.log(stock);

//    if(stock == null){
//     cart_details[a].product_details_id.soldout  = true;
//     cart_details[a].product_details_id.related  = "Sold Out";
//   }else if(stock.soldout == true){
//     cart_details[a].product_details_id.soldout  = true;
//     cart_details[a].product_details_id.related  = "Sold Out";
//   }else if(stock.gross_weight == 0){
//     cart_details[a].product_details_id.soldout  = true;
//     cart_details[a].product_details_id.related  = "NO Available";
//   }else if(stock.gross_weight <= +cart_details[a].gross_weight){
//     cart_details[a].product_details_id.soldout  = true;
//     cart_details[a].product_details_id.related  = "Stock is less";
//   }
//   //console.log("Stock Value Status",cart_details[a].product_details_id.soldout);
//   cart_final_value.push(cart_details[a]);
//   if(a == cart_details.length - 1){
//     res.json({ Status: "Success", Message: "Your Card Details", Data: cart_final_value, Code: 200 });
//   }
//  }
// });

router.post('/mobile/cart/removeall', async function (req, res){
var remove_user_cart={user_id:req.body.user_id};
  await cart_detailsModel.remove(remove_user_cart, function (err, user) {
    if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
    res.json({ Status: "Success", Message: "cart products deleted successfully", Data: user, Code: 200 });
  });


});



router.post('/check_checkout_stock',async function (req, res) {
 console.log(req.body)
  var final_value = [];
  for(let a = 0; a < req.body.check_value.length ; a++){ 
  var temp_value = req.body.check_value[a];
  let stock_params = {fish_combo_id: new mongoose.Types.ObjectId(temp_value.fish_combo_id), status: true, delete_status: false, soldout: false, store:temp_value.store };
  let stock = await stockModel.findOne(stock_params);
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
  }else if(stock.gross_weight < +temp_value.gross_weight){
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
router.post('/mobile/fcm_update',async function (req, res) {
    if (req.body.user_id) {
    userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, { new: true }, function (err, UpdatedDetails) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: "User Details Updated Successfully", Data: UpdatedDetails, Code: 200 });
    });
  }else{
    return res.status(400).json({ Status: "Failed", Message: "User Details Not Fount", Data: {}, Code: 400 });
  }
});

router.post('/mobile/push-notification',async function (req, res) {
try{

  let user_params={_id:new mongoose.Types.ObjectId(req.body.user_id)};

  let user= await userdetailsModel.findOne(user_params);
if((user.fb_token!="") || (user.fb_token)){
if(req.body.order_status=='Booked'){
  let message = {
      notification:{
          title:"Order placed successfully",
          body:"Hi "+user.first_name+",your order "+req.body.order_id+" is placed successfully"
      },
      data:{
      },
      token:user.fb_token,
  };
  FCM.send(message,function(err,resp){

      if(err){
          return res.status(500).send({message: err});
      }else{
          return res.status(200).send({
              message: "Notification sent successfully"

          });
      }
  });

}else if(req.body.order_status=='Order Accept'){
  let message = {
      notification:{
          title:"Order Accepted",
          body:"Hi "+user.first_name+",your order "+req.body.order_id+" has been Accepted"
      },
      data:{
      },
      token:user.fb_token,
  };
  FCM.send(message,function(err,resp){

      if(err){
          return res.status(500).send({message: err});
      }else{
          return res.status(200).send({
              message: "Notification sent successfully"

          });
      }
  });
}else if(req.body.order_status=='Delivered'){
  let message = {
    notification:{
        title:"Order Delivered successfully",
        body:"Hi "+user.first_name+",your order "+req.body.order_id+" has been delivered"
    },
    data:{
    },
    token:user.fb_token,
};
FCM.send(message,function(err,resp){

    if(err){
        return res.status(500).send({message: err});
    }else{
        return res.status(200).send({
            message: "Notification sent successfully"

        });
    }
});
}else if(req.body.order_status=='Cancelled'){
  let message = {
    notification:{
        title:"Order cancelled",
        body:"Hi "+user.first_name+",your order "+req.body.order_id+" has been cancelled"
    },
    data:{
    },
    token:user.fb_token,
};
FCM.send(message,function(err,resp){

    if(err){
        return res.status(500).send({message: err});
    }else{
        return res.status(200).send({
            message: "Notification sent successfully"

        });
    }
});
}
else if(req.body.order_status=='Out for Delivery'){
  let message = {
    notification:{
        title:"Out for delivery",
        body:"Hi "+user.first_name+",your order "+req.body.order_id+" is out for delivery"
    },
    data:{
    },
    token:user.fb_token,
};
FCM.send(message,function(err,resp){

    if(err){
        return res.status(500).send({message: err});
    }else{
        return res.status(200).send({
            message: "Notification sent successfully"

        });
    }
});
}
}else{
  return res.status(400).send({message: "FCM_token empty"});
}

}
catch(err){
  throw(err);

}

});



  setInterval(async(req,res)=>{
    try  {
      let shippingParams={ default_status : true,delete_status : false};   
      let defaultAdd= await shipping_addressModel.find(shippingParams).exec();
      if(!defaultAdd)  {
        res.json({status:"success",Message:"Default Address details Not found", Code: 400});
      }
     let today = new Date();
     let currentDay = 'Sunday';
     if(today.getDay() == 1)  {
      currentDay = 'Monday';
     }  else if(today.getDay() == 2)  {
      currentDay = 'Tuesday';
    }  else if(today.getDay() == 3)  {
      currentDay = 'Wednesday';
    }  else if(today.getDay() == 4)  {
      currentDay = 'Thursday';
    }  else if(today.getDay() == 5)  {
      currentDay = 'Friday';
    }  else if(today.getDay() == 6)  {
      currentDay = 'Saturday';
    }
    
     let test=[];
     for(let i=0; i< defaultAdd?.length;i++)  {
     let vendor = await product_vendorModel.findOne({ pincodes: { $elemMatch: { $eq: defaultAdd[i]?.pincode } }, status: true, delete_status: false }).exec();
     for(let j=0;  j<=vendor?.delivery_slots.length;j++)  {
     let t=vendor?.delivery_slots[j]?.delivery_days.filter(e=>e==currentDay);
      if(t?.length) {
        test.push({delivery_days: vendor?.delivery_slots[j].delivery_days,pincode: defaultAdd[i].pincode,user_id: defaultAdd[i].user_id,order_ends_before:vendor?.delivery_slots[j]?.order_ends_before } );
      }
      }
     }
    let now = new Date();
    now.setMinutes(now.getMinutes() + 30); // timestamp
    now = new Date(now); // Date object
    
    let currentUpdatedTime=`${now.getHours()}`+':'+ `${now.getMinutes()}`
    //let tt="09:30";
    //console.log(typeof(currentUpdatedTime),currentUpdatedTime)
    let finalArray=[];
     for(let k=0;k<=test?.length;k++)  {
      if(test[k]?.user_id)  {
        let userDetails = await userdetailsModel.findOne({ _id: test[k]?.user_id,user_type:1}).exec();
        test[k].userDetails = userDetails;
        //console.log(test[k].order_ends_before,currentUpdatedTime);
        if(test[k].order_ends_before == (currentUpdatedTime).toString())  {
          finalArray.push(test[k]);
        }
        // if(test[k].order_ends_before == tt)  {
    
        //   finalArray.push(test[k]);
    
        // }
      }
     }
      for(let l=0;l<=finalArray.length;l++){
              let message = {
                  notification:{
                      title:"Order placed successfully",
                      body:"Hi"
                  },
                  data:{
                  },
                  token:finalArray[l]?.userDetails?.fb_token,
              };
  if(message.token!=null && message.token!=""){
              FCM.send(message,function(err,resp){
            
                  if(err){
                    
                  }else{
                    
                  }
              });
            }
      }
     //res.send({message:"Notification send successfully"});
    } catch (e) {
      console.log(e);
      res.status(500).json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    }
    
  },500);





module.exports = router;
