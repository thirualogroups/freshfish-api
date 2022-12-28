const express = require("express");
const router = express.Router();
const productCustomerInfoModel = require("../models/productCustomerInfoModel");

router.post("/create", async function (req, res) {
    try {
        productCustomerInfoModel.create({
            info: req.body.info,
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
    productCustomerInfoModel.find({ delete_status: false }, function (err, infoList) {
        res.json({ Status: "Success", Message: "Customer Information Details", Data: infoList, Code: 200 });
    }).populate('user_id');
});

router.post('/edit', function (req, res) {
    productCustomerInfoModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Information Updated", Data: UpdatedDetails, Code: 200 });
    });
});

router.post('/delete', function (req, res) {
    productCustomerInfoModel.updateMany({_id:{$in:req.body._id.split(",")}}, { delete_status: true }, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Information Deleted successfully", Data: UpdatedDetails, Code: 200 });
    });
});


 router.get('/deletes', function (req, res) {
   productCustomerInfoModel.remove({}, function (err, user) {
     if (err) return res.status(500).send("There was a problem deleting the user.");
     res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
   });
});



module.exports = router;