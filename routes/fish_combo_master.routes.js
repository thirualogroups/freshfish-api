var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var fresh_fish_masterModel = require('./../models/fish_combo_masterModel');
var counterMasterModel = require('./../models/counterModel');
const product_detailsModel = require('../models/product_detailsModel');



///////// Admin User///////////
router.post('/createcounter', async function (req, res) {
  try {
    counterMasterModel.create({
      _id: req.body._id
    },
      function (err, user) {
        if (err) res.json({ Status: "Failed", Message: "Internal Server Error", Data: err, Code: 500 });
        res.json({ Status: "Success", Message: "counter details Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    console.log(e);
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: e, Code: 500 });
  }
});

router.post('/create', async function (req, res) {
  let fresh_fish_master  =  await fresh_fish_masterModel.findOne({product_name:req.body.product_name,delete_status:false});
  if(fresh_fish_master == null){
  try {
    const counter = await counterMasterModel.findByIdAndUpdate({ _id:'fishComboMaster'},{$inc:{seq:1}});
    fresh_fish_masterModel.create({
      product_name: req.body.product_name,
      code: counter.seq.toString().padStart(4, '0')
    },
      function (err, user) {
        if (err) res.json({ Status: "Failed", Message: "Internal Server Error", Data: err, Code: 500 });
        res.json({ Status: "Success", Message: "Product Details Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    console.log(e);
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: e, Code: 500 });
  }
}else{
  res.status(400).json({Status:"Failed",Message:"fish combo already exist", Data : {} ,Code:400});

}
});

router.post('/getlist_id', function (req, res) {
  fresh_fish_masterModel.findById(req.body._id, function (err, StateList) {
    res.json({ Status: "Success", Message: "product Detail  List", Data: StateList, Code: 200 });
  });
});

router.get('/getlist', function (req, res) {
  let params = { delete_status: false };
  fresh_fish_masterModel.find(params, function (err, Functiondetails) {
    res.json({ Status: "Success", Message: "product screen  Details", Data: Functiondetails, Code: 200 });
  });
});

router.get('/getlist_for_add_stock', async function (req, res) {
  try {
    let params = { delete_status: false };
    let products = await product_detailsModel.find({ delete_status: false });
    let _ids = products.map(x => x.fish_combo_id);
    params._id = { $in: _ids };
    fresh_fish_masterModel.find(params, function (err, list) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: err, Code: 500 });
      res.json({ Status: "Success", Message: "Product Details Details", Data: list, Code: 200 });
    });
  }
  catch (ex) {
    return res.json({ Status: "Failed", Message: "Internal Server Error", Data: ex, Code: 500 });
  }
});

router.post('/delete', function (req, res) {
  let c = {
    delete_status: true
  }
  fresh_fish_masterModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Product Master Deleted Successfully", Data: UpdatedDetails, Code: 200 });
  });
});

router.post('/edit', async function (req, res) {
  let fresh_fish_master  =  await fresh_fish_masterModel.findOne({product_name:req.body.product_name,delete_status:false});
  if(fresh_fish_master == null){
  fresh_fish_masterModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Product Details  Updated", Data: UpdatedDetails, Code: 200 });
  });
}else{
  res.status(400).json({Status:"Failed",Message:"fish combo already exist", Data : {} ,Code:400});

}
});

router.post('/admin_delete', function (req, res) {
  fresh_fish_masterModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Product Details Deleted Successfully", Data: {}, Code: 200 });
  });
});

 router.get('/deletes', function (req, res) {
    fresh_fish_masterModel.remove({}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
    });
 });



////////////

module.exports = router;
