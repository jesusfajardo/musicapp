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

//CRUD Create, Read, Update, Delete
//Creation of users
router.post(/restaurantimg\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    upload(req, res, (err) => {
      if (err) {
        res.status(500).json({
          "msn" : "No se ha podido subir la imagen"
        });
      } else {
        var ruta = req.file.path.substr(6, req.file.path.length);
        console.log(ruta);
        var img = {
          idrestaurant: req.body.idrestaurant,
          name : req.file.originalname,
          physicalpath: req.file.path,
          relativepath: "http://192.168.1.5:8000" + ruta
        };
        var imgData = new Img(img);
        imgData.save().then( (infoimg) => {
          //content-type
          //Update User IMG
          var restaurant = {
            fotolugar: new Array()
          }
          Restaurant.findOne({_id:id}).exec( (err, docs) =>{
            //console.log(docs);
            var data = docs.fotolugar;
            console.log('data ', data);
  
            var aux = new  Array();
            if (data.length == 1 && data[0] == "") {
              Restaurant.fotolugar.push("/api/v1.0/restaurantimg/" + infoimg._id)
            } else {
              aux.push("/api/v1.0/restaurantimg/" + infoimg._id);
              data = data.concat(aux);
              Restaurant.fotolugar = data;
            }
            Restaurant.findOneAndUpdate({_id : id}, restaurant, (err, params) => {
                if (err) {
                  res.status(500).json({
                    "msn" : "error en la actualizacion del usuario"
                  });
                  return;
                }
                res.status(200).json(
                  req.file
                );
                return;
            });
          });
        });
      }
    });
  });
  router.get(/restaurantimg\/[a-z0-9]{1,}$/, (req, res) => {
    var url = req.url;
    var id = url.split("/")[2];
    console.log(id)
    Img.findOne({_id: id}).exec((err, docs) => {
      if (err) {
        res.status(500).json({
          "msn": "Sucedio algun error en el servicio"
        });
        return;
      }
      //regresamos la imagen deseada
      var img = fs.readFileSync("./" + docs.physicalpath);
      //var img = fs.readFileSync("./public/avatars/img.jpg");
      res.contentType('image/jpeg');
      res.status(200).send(img);
    });
  });

  module.exports = router;