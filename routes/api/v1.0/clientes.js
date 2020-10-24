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

router.post("/cliente",  (req, res) => {


    var data = req.body;
    data ["registerdate"] = new Date();
    var newcliente = new Cliente(data);
    newcliente.save().then((rr) =>{
      res.status(200).json({
        "resp": 200,
        "dato": newcliente,
        "msn" :  "cliente  agregado con exito"
      });
    });
  });

  router.get("/cliente",(req, res) => {
    var skip = 0;
    var limit = 10;
    if (req.query.skip != null) {
      skip = req.query.skip;
    }
  
    if (req.query.limit != null) {
      limit = req.query.limit;
    }
    Cliente.find({}).skip(skip).limit(limit).exec((err, docs) => {
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

  router.get(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    Cliente.findOne({_id : id}).exec( (error, docs) => {
      if (docs != null) {
          res.status(200).json(docs);
          return;
      }
  
      res.status(200).json({
        "msn" : "No existe el pedido "
      });
    });
  });

  //elimina un cliente
router.delete(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    Cliente.find({_id : id}).remove().exec( (err, docs) => {
      res.json({
          message: "cliente eliminado"
          });
    });
  });

  //Actualizar solo x elementos
router.patch(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split( "/")[4];
    var keys = Object.keys(req.body);
    var cliente = {
      nombre : req.body.nombre,
      ci : req.body.ci,
      telefono : req.body.telefono,
      email : req.body.email,
  
    };
    console.log(cliente);
    Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
        if(err) {
          res.status(500).json({
            "msn": "Error no se pudo actualizar los datos"
          });
          return;
        }
        res.status(200).json({
          "resp": 200,
          "dato": cliente,
          "msn" :  "cliente  editado con exito"
        });
        return;
    });
  });
  //Actualiza los datos del cliente
  router.put(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    var keys  = Object.keys(req.body);
    var oficialkeys = ['nombre', 'ci', 'telefono', 'email',];
    var result = _.difference(oficialkeys, keys);
    if (result.length > 0) {
      res.status(400).json({
        "msn" : "erorr no se puede actualizar intenten con patch"
      });fmulter
      return;
    }
    var cliente = {
      nombre : req.body.nombre,
      ci : req.body.ci,
      telefono : req.body.telefono,
      email : req.body.email,
  
    };
    Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
        if(err) {
          res.status(500).json({
            "msn": "Error no se pudo actualizar los datos"
          });
          return;
        }
        res.status(200).json({
          "resp": 200,
          "dato": cliente,
          "msn" :  "cliente  editado con exito"
        });
        return;
    });
  });
  


  module.exports = router;
