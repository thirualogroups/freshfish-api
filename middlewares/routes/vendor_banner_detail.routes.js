var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var vendor_banner_detailModel = require('./../models/vendor_banner_detailModel');




//////////// Admin User //////////////////


router.post('/create', async function(req, res) {
  try{

        await vendor_banner_detailModel.create({
            img_path:  req.body.img_path,
            img_title : req.body.img_title,
            img_describ : req.body.img_describ,
            img_index : req.body.img_index,
            show_status : req.body.show_status,
            date_and_time : req.body.date_and_time,
            delete_status : false
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Banner Details Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});

router.get('/deletes', function (req, res) {
      vendor_banner_detailModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Banner Details Deleted Successfully", Data : {} ,Code:200});     
      });
});

router.post('/getlist_id', function (req, res) {
        vendor_banner_detailModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Banner Details  List", Data : StateList ,Code:200});
        });
});

router.get('/getlist', function (req, res) {
        vendor_banner_detailModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"Banner Details List", Data : Functiondetails ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        vendor_banner_detailModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Banner  Updated Sucessfully", Data : UpdatedDetails ,Code:200});
        });
});


router.post('/delete', function (req, res) {
  vendor_banner_detailModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Banner Details Deleted successfully", Data : {} ,Code:200});
      });
});



router.post('/update', function (req, res) {
        vendor_banner_detailModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Banner Details  Updated Sucessfully", Data : UpdatedDetails ,Code:200});
        });
});



// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
      vendor_banner_detailModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Banner Details Deleted successfully", Data : {} ,Code:200});
      });
});


 ///////// ///////// ///////// ///////// /////////


module.exports = router;
