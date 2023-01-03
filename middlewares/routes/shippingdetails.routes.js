var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var shipping_addressModel = require('./../models/shipping_addressModel');
var locationdetailsModel = require('./../models/locationdetailsModel');
var mongoose = require('mongoose');

// router.post('/create', async function(req, res) {
// let insert = true;
//   if(req.body.address_type.toLowerCase() === 'home' || req.body.address_type.toLowerCase() === 'office'){
//     let address = await shipping_addressModel.findOne({address_type:req.body.address_type});
//     if(address !== null){
//       edit(address._id, req.body);
//       insert = false;
//     }
//   }
//   if(insert){
// var address_stauts = '';
// var shipping_addres = await shipping_addressModel.findOne({user_id:req.body.user_id,address_stauts:"Last Used"});
//           if(shipping_addres == null){
//              address_stauts = "Last Used";
//           }
//   try{
//     await shipping_addressModel.create({
//            user_id : req.body.user_id,
//            first_name :  req.body.first_name,
//            last_name : req.body.last_name,
//            flat_no : req.body.flat_no,
//            street : req.body.street,
//            landmark : req.body.landmark,
//            pincode :req.body.pincode,
//            state : req.body.state,
//            city : req.body.city || "",
//            mobile : req.body.mobile,
//            alter_mobile : req.body.alter_mobile,
//            // address_status : address_status,
//            address_status : "Last Used",
//            address_type : req.body.address_type,
//            address: req.body.address,
//            display_date : req.body.display_date
//         }, 
//         function (err, user) {
//            console.log(err);
//           console.log(user)
//         res.json({Status:"Success",Message:"Shipping address successfully", Data : user ,Code:200}); 
//         });     
// }
// catch(e){
//     console.log(e);
//       res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
// }
//   }
// });



router.post('/create', async function(req, res) {
console.log("shippling Address creae",req.body)
var shipping_addres = await shipping_addressModel.findOne({user_id:req.body.user_id,address:req.body.address,delete_status: false});
console.log("shippling Address creae_one",shipping_addres)
if(shipping_addres == null){    
  try{
    await shipping_addressModel.create({
           user_id : req.body.user_id,
           first_name :  req.body.first_name,
           last_name : req.body.last_name,
           flat_no : req.body.flat_no,
           street : req.body.street,
           landmark : req.body.landmark,
           pincode :req.body.pincode,
           state : req.body.state,
           city : req.body.city || "",
           mobile : req.body.mobile,
           alter_mobile : req.body.alter_mobile,
           address_status : "Last Used",
           address_type : req.body.address_type,
           address: req.body.address,
           display_date : req.body.display_date,
           houseno:req.body.houseno,
           Additional_Phone_No:req.body.Additional_Phone_No
        }, 
        function (err, user) {
           console.log(err);
          console.log(user)
        res.json({Status:"Success",Message:"Shipping address successfully", Data : user ,Code:200}); 
        });     
}
catch(e){
    console.log(e);
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
  }else{
    res.status(400).json({Status:"Failed",Message:"Shipping address already exist", Data : user ,Code:400});
  }
});


router.post('/fetch_by_userid', function (req, res) {
        shipping_addressModel.findOne({user_id:req.body.user_id,address_stauts : "Last Used"}, function (err, StateList) {
          if(StateList == null){
           res.json({Status:"Success",Message:"No Shipping address details", Data : {} ,Code:200}); 
          }else{
             res.json({Status:"Success",Message:"Shipping address details", Data : StateList ,Code:200});
          }
        });
});


router.post('/fetch_by_userid1', function (req, res) {
        locationdetailsModel.findOne({user_id:req.body.user_id,default_status : true}, function (err, StateList) {
          if(StateList == null){
           res.json({Status:"Success",Message:"No Shipping address details", Data : {} ,Code:200}); 
          }else{
             res.json({Status:"Success",Message:"Shipping address details", Data : StateList ,Code:200});
          }
        }).populate('user_id');
});




router.post('/listing_address_by_userid', function (req, res) {
        shipping_addressModel.find({user_id:req.body.user_id}, function (err, StateList) {
          if(StateList.length == 0){
           res.json({Status:"Success",Message:"No Shipping address details", Data : [] ,Code:200}); 
          }else{
             res.json({Status:"Success",Message:"Shipping address details", Data : StateList ,Code:200});
          }
        }).sort({_id: -1});
});



router.post('/mark_used_address',async function (req, res) {
         console.log(req.body);
          var shipping_addres = await shipping_addressModel.findOne({user_id:req.body.user_id,address_stauts:"Last Used"});
          let a  = {
             address_stauts : ""
          }
          shipping_addressModel.findByIdAndUpdate(shipping_addres._id, a, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
            console.log("UpdatedDetails",UpdatedDetails);
              // res.json({Status:"Success",Message:"Shipping address Updated", Data : UpdatedDetails ,Code:200});
          });
          shipping_addressModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
              res.json({Status:"Success",Message:"Shipping address Updated", Data : UpdatedDetails ,Code:200});
          });        
});


router.post('/update_address', function (req, res) {
       shipping_addressModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Shipping address details Updated", Data : UpdatedDetails ,Code:200});
        });
});






router.post('/filter_date', function (req, res) {
        shipping_addressModel.find({}, function (err, StateList) {
          var final_Date = [];
          for(let a = 0; a < StateList.length; a ++){
            var fromdate = new Date(req.body.fromdate);
            var todate = new Date(req.body.todate);
            var checkdate = new Date(StateList[a].createdAt);
            console.log(fromdate,todate,checkdate);
            if(checkdate >= fromdate && checkdate <= todate){
              final_Date.push(StateList[a]);
            }
            if(a == StateList.length - 1){
              res.json({Status:"Success",Message:"Demo screen  List", Data : final_Date ,Code:200});
            }
          }
        });
});



router.get('/deletes', function (req, res) {
      shipping_addressModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Shipping addressDeleted", Data : {} ,Code:200});     
      });
});


router.post('/getlist_id', function (req, res) {
        shipping_addressModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Shipping address List", Data : StateList ,Code:200});
        });
});



router.post('/mark_as_default',async function (req, res) {
     var exit_shipping_addres = await shipping_addressModel.findOne({user_id:req.body.user_id,default_status:true});
     if(exit_shipping_addres !== null){
     shipping_addressModel.findByIdAndUpdate(exit_shipping_addres._id, { "default_status": false}, {new: true}, function (err, UpdatedDetails) {
     if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
     // res.json({Status:"Success",Message:"Shipping address Updated", Data : UpdatedDetails ,Code:200});
     });
     }
     shipping_addressModel.findByIdAndUpdate(req.body._id, { "default_status": true}, {new: true}, function (err, UpdatedDetails) {
     if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
     res.json({Status:"Success",Message:"Shipping address Updated", Data : UpdatedDetails ,Code:200});
     });
});


router.post('/mobile/delete_address',async function (req, res) {
     shipping_addressModel.findByIdAndUpdate(req.body._id, { delete_status:true}, {new: true}, function (err, UpdatedDetails) {
     if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
     res.json({Status:"Success",Message:"Shipping address Deleted", Data : UpdatedDetails ,Code:200});
     });
});


router.get('/getlist', function (req, res) {
  if(req.query.user_id !==""){

  
   let params = { user_id:new mongoose.Types.ObjectId(req.query.user_id),delete_status: false};

        shipping_addressModel.find(params, function (err, Functiondetails) {
          if(err) res.json({Status:"Fail",Message: err.message, Code: 500});
          res.json({Status:"Success",Message:"Shipping address Details", Data : Functiondetails ,Code:200});
        });
      }else{
        res.status(400).json({Status:"Failed",Message:"User not found",Code:400});
      }
});


router.get('/mobile/getlist', function (req, res) {
        shipping_addressModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"Shipping address Details", Data : a ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        edit(req.body._id, req, res);
});

function edit(_id, req,res){
  shipping_addressModel.findByIdAndUpdate(_id, req.body, {new: true}, function (err, UpdatedDetails) {
    if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
     res.json({Status:"Success",Message:"Shipping address Updated", Data : UpdatedDetails ,Code:200});
});
}

// router.post('/delete', function (req, res) {
//  let c = {
//     delete_status : true
//   }
//   shipping_addressModel.findByIdAndUpdate(req.body._id, c, {new: true}, function (err, UpdatedDetails) {
//             if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
//              res.json({Status:"Success",Message:"Location Deleted successfully", Data : UpdatedDetails ,Code:200});
//   });
// });



// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      shipping_addressModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Shipping address Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;
