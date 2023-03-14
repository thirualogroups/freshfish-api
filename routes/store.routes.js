const express = require("express");
const router = express.Router();
const storesModel = require("./../models/storesModel");
var counterMasterModel = require("../models/counterModel");
const product_vendorModel = require("../models/product_vendorModel");
const stockModel = require("../models/stockModel");
var mongoose = require('mongoose');

const product_detailsModel = require('./../models/product_detailsModel');


/////////// Admin User ////////



router.post("/create", async function (req, res) {
    let store  =  await storesModel.findOne({name:req.body.name,delete_status:false});
    if(store == null){
    try {
        const counter = await counterMasterModel.findByIdAndUpdate({ _id: 'store' }, { $inc: { seq: 1 } });
        storesModel.create({
            name: req.body.name,
            phoneno: req.body.phoneno,
            email: req.body.email,
            location: req.body.location,
            type: req.body.type,
            address: req.body.address,
            status: req.body.status,
            code: counter.seq.toString().padStart(4, "0")
        },async function (err, store) {
            console.log(err);
            if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
             product_detailsModel.find({delete_status: false,store:"63a015833ad8ae630871d242"},async function (err, list) {
               if (err) return res.json({ Status: "Fail", Message: err.message, Code: 500 });
        list.forEach(element => {
        product_detailsModel.create({
            "product_img": element.product_img,
            "addition_detail": element.addition_detail,
            "delete_status": element.delete_status,
            "discount": element.discount,
            "discount_amount": element.discount_amount,
            "discount_status": element.discount_status,
            "discount_cal": element.discount_cal,
            "product_rating": element.product_rating,
            "product_review": element.product_review,
            "gross_weight": element.gross_weight,
            "min_net_weight": element.min_net_weight,
            "max_net_weight": element.max_net_weight,
            "recommendation": element.recommendation,
            "customer_information": element.customer_information,
            "soldout": element.soldout,
            "cat_id": element.cat_id,
            "thumbnail_image": element.thumbnail_image,
            "fish_combo_id": element.fish_combo_id,
            "store": store._id,
            "cost": element.cost,
            "product_discription": element.product_discription,
            "condition": element.condition,
            "price_type": element.price_type,
            "variation":element.variation,
            "date_and_time": element.date_and_time,
            "mobile_type": element.mobile_type,
            "related": element.related,
            "count": element.count,
            "status": element.status,
            "verification_status": element.verification_status,
            "fav_status": element.fav_status,
            "today_deal": element.today_deal,
            "discount_start_date": element.discount_start_date,
            "discount_end_date": element.discount_end_date,
            "unit": element.unit,
            "variation_list": element.variation_list,
        },async function (err, store) {
            console.log(err);
        });
        });
            
             });
            res.json({ Status: "Success", Messaeg: "Store added successfully", Data: store, Code: 200 });
        });
    }
    catch (ex) {
        console.log(ex);
        res.json({ Status: "Failed", Message: ex.message, Code: 500 });
    }
}else{
    res.status(400).json({Status:"Failed",Message:"Store Name Already Exist", Data : {} ,Code:400});
}
});


router.get('/getlist_store', function (req, res) {
    storesModel.find({delete_status: false }, function (err, storesList) {
        res.json({ Status: "Success", Message: "Store Details", Data: storesList, Code: 200 });
    }).populate('user_id');
});

router.get('/getlist', function (req, res) {
    storesModel.find({delete_status: false,status:true}, function (err, storesList) {
        res.json({ Status: "Success", Message: "Store Details", Data: storesList, Code: 200 });
    }).populate('user_id');
});


router.get('/getlist_counter', function (req, res) {
    counterMasterModel.find({}, function (err, storesList) {
        res.json({ Status: "Success", Message: "getlist_counter", Data: storesList, Code: 200 });
    });




});

router.post('/edit', async function (req, res) {
         let store  =  await storesModel.findOne({name:req.body.name,delete_status:false});
         if(store == null){
    storesModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
           
    product_vendorModel.updateMany({store: req.body._id}, 
    {status: req.body.status}, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated Docs : ", docs);
    }
    });

      stockModel.updateMany({store: req.body._id}, 
    {status: req.body.status}, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated Docs : ", docs);
    }
    });


      
          // var datas_two = stockModel.updateMany({ store:req.body._id },{status: req.body.status});
        res.json({ Status: "Success", Message: "Vendor Updated", Data: UpdatedDetails, Code: 200 });
    });
}else{
    res.status(400).json({Status:"Failed",Message:"Store Name Already Exist", Data : {} ,Code:400});
}
});


router.post('/getlist_id', function (req, res) {
    storesModel.findOne({ _id: req.body._id }, function (err, StateList) {
        res.json({ Status: "Success", Message: "Vendor List", Data: StateList, Code: 200 });
    });
});



router.post('/store_product_delete', function (req, res) {
    product_detailsModel.find({"store": req.body.store_id}, function (err, StateList) {
                StateList.forEach(element => {
     product_detailsModel.findByIdAndRemove(element._id, function (err, user) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    });
                });
        res.json({ Status: "Success", Message: "Vendor List", Data: StateList, Code: 200 });
    });
});




router.post('/delete', function (req, res) {
    storesModel.findByIdAndUpdate(req.body._id, { delete_status: true }, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Store Deleted successfully", Data: UpdatedDetails, Code: 200 });
    });
});

router.post('/admin_delete', function (req, res) {
    storesModel.findByIdAndRemove(req.body._id, function (err, user) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Store Deleted successfully", Data: {}, Code: 200 });
    });
});



router.get('/deletes', function (req, res) {
   storesModel.remove({}, function (err, user) {
     if (err) return res.status(500).send("There was a problem deleting the user.");
     res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
   });
});




//////////////////////////////////////////////////////////////////












module.exports = router;

