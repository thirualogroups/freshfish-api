const express = require("express");
const router = express.Router();
const storesModel = require("./../models/storesModel");
var counterMasterModel = require("../models/counterModel");
const product_vendorModel = require("../models/product_vendorModel");
const stockModel = require("../models/stockModel");
var mongoose = require('mongoose');




/////////// Admin User ////////



router.post("/create", async function (req, res) {
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
        }, function (err, store) {
            console.log(err);
            if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
            else res.json({ Status: "Success", Messaeg: "Store added successfully", Data: store, Code: 200 });
        });
    }
    catch (ex) {
        console.log(ex);
        res.json({ Status: "Failed", Message: ex.message, Code: 500 });
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

router.post('/edit', function (req, res) {
         console.log(req.body);
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
});


router.post('/getlist_id', function (req, res) {
    storesModel.findOne({ _id: req.body._id }, function (err, StateList) {
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

