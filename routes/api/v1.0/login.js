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

/*
Login USER
*/
router.post("/login", (req, res, next) => {
    var email = req.body.email;
    var password = req.body.password;
    var result = Cliente.findOne({email: email,password: password}).exec((err, doc) => {
      if (err) {
        res.status(300).json({
          msn : "No se puede concretar con la peticion "
        });
        return;
      }
      console.log(doc);
      if (doc) {
         console.log(result);
        //res.status(200).json(doc);
        jwt.sign({name: doc.email, password: doc.password}, "secretkey123", (err, token) => {
            console.log(result);
            res.status(200).json({
              resp:200,
              token : token,
              dato:doc
            });
        })
      } else {
        res.status(400).json({
          resp: 400,
          msn : "El usuario no existe ne la base de datos"
        });
      }
    });
  });
  //Middelware
  function verifytoken (req, res, next) {
    //Recuperar el header
    const header = req.headers["authorization"];
    if (header  == undefined) {
        res.status(403).json({
          msn: "No autorizado"
        })
    } else {
        req.token = header.split(" ")[1];
        jwt.verify(req.token, "secretkey123", (err, authData) => {
          if (err) {
            res.status(403).json({
              msn: "No autorizado"
            })
          } else {
            next();
          }
        });
    }
  }

  module.exports = router;