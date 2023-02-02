var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var stockModel = require('./../models/stockModel');
const fish_combo_masterModel = require('../models/fish_combo_masterModel');
const mongoose = require("mongoose");
const product_detailsModel = require('../models/product_detailsModel');
const product_vendorModel = require('./../models/product_vendorModel');

router.post('/create', async function (req, res) {
  try {
    await stockModel.findOneAndUpdate({
      store: new mongoose.Types.ObjectId(req.body.store),
      fish_combo_id: new mongoose.Types.ObjectId(req.body.fish_combo_id), delete_status: false
    }, {
      store: req.body.store,
      fish_combo_id: req.body.fish_combo_id,
      unit: req.body.unit,
      gross_weight: req.body.gross_weight,
      price: req.body.price,
      status: req.body.status || true,
      soldout: req.body.soldout || false
    }, { upsert: true, new: true },
      async function (err, stock) {
        if (err) res.json({ Status: "Fail", Message: err.message, Code: 500 });
        // await fish_combo_masterModel.updateOne({ _id: new mongoose.Types.ObjectId(req.body.fish_combo_id) }, { stock: req.body.gross_weight });
        await product_detailsModel.updateMany({ fish_combo_id: new mongoose.Types.ObjectId(req.body.fish_combo_id) }, { unit: req.body.unit });
        await stockModel.updateMany({ fish_combo_id: new mongoose.Types.ObjectId(req.body.fish_combo_id) }, { unit: req.body.unit });
        await product_detailsModel.updateMany({ fish_combo_id: new mongoose.Types.ObjectId(req.body.fish_combo_id), store: new mongoose.Types.ObjectId(req.body.store) }, { cost: req.body.price });
        res.json({ Status: "Success", Message: "Stock Updated successfully", Data: stock, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: e.message, Code: 500 });
  }
});

router.post('/bulk_update', async function (req, res) {
  for (x of req.body.list) {
    try {
      await stockModel.findOneAndUpdate({
        store: new mongoose.Types.ObjectId(x.store),
        fish_combo_id: new mongoose.Types.ObjectId(x.fish_combo_id), delete_status: false
      }, {
        store: x.store,
        fish_combo_id: x.fish_combo_id,
        unit: x.unit,
        gross_weight: x.gross_weight,
        price: x.price,
        status: x.status
      }, { upsert: true, new: true },
        async function (err, stock) {
          if (err) throw err;
          await fish_combo_masterModel.updateOne({ _id: new mongoose.Types.ObjectId(stock.fish_combo_id) }, { stock: stock.gross_weight });
        });
    }
    catch (e) {
      return res.json({ Status: "Failed", Message: "Internal Server Error", Data: e.message, Code: 500 });
    }
  }
  return res.json({ Status: "Success", Message: "Stock Updated successfully", Code: 200 });
});

router.post('/getlist_id', function (req, res) {
  stockModel.findById(req.body._id, function (err, list) {
    res.json({ Status: "Success", Message: "product details screen  List", Data: list, Code: 200 });
  });
});

router.get('/getlist', async function (req, res) {
  let params = { delete_status: false };
  stockModel.find(params, function (err, list) {
    console.log(list);
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: err.message, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen  Details", Data: list, Code: 200 });
  }).populate([{ path: "agent", select: ["bussiness_name", "user_name", "code"] }, { path: "store", select: ["name", "code"], match: { status: true } }, { path: "fish_combo_id", select: ["product_name", "code"] }]);
});

router.post("/getdetails", async function(req, res) {
  let params = { delete_status: false };
  if(req.body.fish_combo_id){
    params.fish_combo_id = req.body.fish_combo_id;
  }
  stockModel.find(params, function (err, list) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: err.message, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen  Details", Data: list, Code: 200 });
  }).populate([{ path: "agent", select: ["bussiness_name", "user_name", "code"] }, { path: "store", select: ["name", "code"], match: { status: true } }, { path: "fish_combo_id", select: ["product_name", "code"] }]);
});

router.post('/getlist', async function (req, res) {
  try {
    let fish_combo_id, store = req.body.store;
    if (req.body.product_id) {
      const product = await product_detailsModel.findById(req.body.product_id);
      if (product != null) {
        fish_combo_id = product.fish_combo_id;
      }
    }
    if (req.body.pincode) {
      const vendors = await product_vendorModel.find({ pincodes: { $elemMatch: { $eq: req.body.pincode } }, status: true }, { _id: 1, store: 1 });
      if (vendors.length > 0) {
        store = vendors[0].store;
      }
    }
    let params = { delete_status: false };
    if (fish_combo_id) {
      params.fish_combo_id = new mongoose.Types.ObjectId(fish_combo_id);
    }
    const aggr = [
      { $match: params },
      {
        $lookup: {
          from: "stocks",
          let: { "id": "$_id" },
          as: "stock",
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$fish_combo_id", "$$id"] }, { $eq: ["$store", new mongoose.Types.ObjectId(store)] }] } } },
            { $project: { gross_weight: 1, price: 1, unit: 1, _id: 1, status: 1, soldout: 1 } },
            {$sort: { soldout: { $meta: false }}}
          ]
        }
      },
      {
        $project: { createdAt: 0, updatedAt: 0, delete_status: 0, __v: 0 }
      }
    ]
    fish_combo_masterModel.aggregate(aggr).exec(function (err, list) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: err.message, Code: 500 });
      for(x of list){
        x.gross_weight = x.stock[0]?.gross_weight ?? 0;
        x.unit = x.stock[0]?.unit ?? "";
        x.price = x.stock[0]?.price ?? 0;
        x.stockid = x.stock[0]?._id ?? "";
        x.stauts = x.stock[0]?.status ?? true;
        x.soldout = x.stock[0]?.soldout ?? true;
        delete x.stock;
      }
      if (fish_combo_id) {
        res.json({ Status: "Success", Message: "Stock Details", Data: list[0], Code: 200 });
      } else {
        res.json({ Status: "Success", Message: "Stock Details", Data: list, Code: 200 });
      }
    });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: e.message, Code: 500 });
  }
});

router.post('/delete', function (req, res) {
  let c = {
    delete_status: true
  }
  stockModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Product Master Deleted successfully", Data: UpdatedDetails, Code: 200 });
  });
});

router.post('/edit', function (req, res) {
  stockModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    else if (UpdatedDetails == null) res.json({ Status: "Failed", Message: "No Record has been updated", Code: 400 })
    else res.json({ Status: "Success", Message: "product details screen  Updated", Data: UpdatedDetails, Code: 200 });
  });
});

router.post('/admin_delete', function (req, res) {
  stockModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "product details screen Deleted successfully", Data: {}, Code: 200 });
  });
});



 router.get('/deletes', function (req, res) {
    stockModel.remove({}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
    });
 });


module.exports = router;

