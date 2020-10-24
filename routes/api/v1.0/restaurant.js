var express = require('express');
//const multer = require('multer');
var router = express.Router();
//var fs = require('fs');
var _ = require("underscore");

var Img = require("../../../database/collections/img");

var Menus = require("../../../database/collections/../../database/collections/menus");
var Orden = require("../../../database/collections/../../database/collections/orden");
var Restaurant = require("../../../database/collections/../../database/collections/restaurant");
var Cliente = require("../../../database/collections/../../database/collections/cliente");
var Users = require("../../../database/collections/../../database/collections/users");
var Detalle = require("../../../database/collections/../../database/collections/detalle");

/*RESTAURANT*/
router.post("/restaurant", (req, res) => {

    //Ejemplo de validacion
    var data = req.body;
    data ["registerdate"] = new Date();
    var newrestaurant = new Restaurant(data);
    newrestaurant.save().then((rr) =>{
      res.status(200).json({
        "resp": 200,
        "dato": newrestaurant,
        "id" : rr._id,
        "msn" :  "restaurante agregado con exito"
      });
    });
  });
  router.get("/restaurant",  (req, res) => {
    var skip = 0;
    var limit = "";
    if (req.query.skip != null) {
      skip = req.query.skip;
    }
  
    if (req.query.limit != null) {
      limit = req.query.limit;
    }
    Restaurant.find({}).skip(skip).limit(limit).exec((err, docs) => {
      if (err) {
        res.status(500).json({
          "msn" : "Error en la db"
        });
  
        return;
      }
      res.json({
        result : docs
      });
    });
  });
  
  
  
  //mostrar  por id los restaurant
  router.get(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    Restaurant.findOne({_id : id}).exec( (error, docs) => {
      if (docs != null) {
          res.status(200).json(docs);
          return;
      }
  
    res.json({
      result : docs
  
      });
    })
  });
  //elimina un restaurant
  
  router.delete('/restaurant/:id',  (req, res, )=> {
    var idRestaurant = req.params.id;
  
    Restaurant.findByIdAndRemove(idRestaurant).exec()
        .then(() => {
          res.status(200).json({
            "resp": 200,
            "msn" :  "eliminado con exito"
          });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
  
  
  });
  //Actualizar solo x elementos
  router.patch(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    var keys = Object.keys(req.body);
    var restaurant = {};
    for (var i = 0; i < keys.length; i++) {
      restaurant[keys[i]] = req.body[keys[i]];
    }
    console.log(restaurant);
    Restaurant.findOneAndUpdate({_id: id}, restaurant, (err, params) => {
        if(err) {
          res.status(500).json({
            "msn": "Error no se pudo actualizar los datos"
          });
          return;
        }
        res.status(200).json(params);
        return;
    });
  });
  //Actualiza los datos del restaurant 
  router.put(/restaurant\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    var keys  = Object.keys(req.body);
    var oficialkeys = ['nombre', 'nit', 'propiedad', 'calle', 'telefono', 'lat', 'lon'];
    var result = _.difference(oficialkeys, keys);
    if (result.length > 0) {
      res.status(400).json({
        "msn" : "error nose puede  actualizar  utilice patch  para la actualizar"
      });
      return;
    }
  
    var restaurant = {
      nombre : req.body.Nombre,
      nit : req.body.Nit,
      propiedad : req.body.Propiedad,
      calle : req.body.Calle,
      telefono : req.body.Telefono,
      lat : req.body.Lat,
      lon : req.body.Lon
  
    };
    Restaurant.findOneAndUpdate({_id: id}, restaurant, (err, params) => {
        if(err) {
          res.status(500).json({
            "msn": "Error no se pudo actualizar los datos"
          });
          return;
        }
        res.status(200).json({
          "resp": 200,
          "dato": restaurant,
          "msn" :  "restaurant editado con exito"
        });
        return;
    });
  });
  /*RESTAURANT*/

  module.exports = router;