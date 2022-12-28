const express = require("express");
const router = express.Router();
const transaction_logsModel = require("../models/transaction_logsModel");

router.post("/create", async function (req, res) {
    try {
        transaction_logsModel.create({
            order_id: req.body.order_id,
            currency: req.body.currency,
            txnamount: req.body.txnamount,
            txnid: req.body.txnid,
            status: req.body.status,
            respcode: req.body.respocode,
            respmsg: req.body.respmsg
        }, function (err, info) {
            console.log(err);
            if (err) res.json({ Status: "Failed", Message: err.message, Code: 500 });
            else res.json({ Status: "Success", Messaeg: "Info added successfully", Data: info, Code: 200 });
        });
    }
    catch (ex) {
        console.log(ex);
        res.json({ Status: "Failed", Message: ex.message, Code: 500 });
    }
});

router.get('/getlist', function (req, res) {
    let params = {};
    if(req.query.order_id){
        params.order_id = ""+req.query.order_id;
    }
    console.log(params);
    transaction_logsModel.find(params, function (err, infoList) {
        res.json({ Status: "Success", Message: "Customer Information Details", Data: infoList, Code: 200 });
    });
});


router.get('/getlist_all', function (req, res) {
    transaction_logsModel.find({}, function (err, infoList) {
        res.json({ Status: "Success", Message: "Customer Information Details", Data: infoList, Code: 200 });
    });
});




router.post('/edit', function (req, res) {
    transaction_logsModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Information Updated", Data: UpdatedDetails, Code: 200 });
    });
});

router.post('/delete', function (req, res) {
    transaction_logsModel.updateMany({_id:{$in:req.body._id.split(",")}}, { delete_status: true }, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Information Deleted successfully", Data: UpdatedDetails, Code: 200 });
    });
});


 router.get('/deletes', function (req, res) {
    transaction_logsModel.remove({}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
    });
 });

module.exports = router;