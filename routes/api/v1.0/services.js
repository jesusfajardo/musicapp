var express = require('express');
const multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");
var Menus = require("../../../database/collections/../../database/collections/menus");
var Orden = require("../../../database/collections/../../database/collections/orden");

var Cliente = require("../../../database/collections/../../database/collections/cliente");

var Detalle = require("../../../database/collections/../../database/collections/detalle");

var jwt = require("jsonwebtoken");


const storage = multer.diskStorage({
  destination: function (res, file, cb) {
      try {
          fs.statSync('./public/avatars');
      } catch (e) {
          fs.mkdirSync('./public/avatars');
      }

      cb(null, './public/avatars');
  },
  filename: (res, file, cb) => {

      cb(null, 'IMG-' + Date.now() + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      return cb(null, true);
  }
  return cb(new Error('Solo se admiten imagenes png y jpeg'));
}

const upload = multer({
  storage: storage,
  //fileFilter: fileFilter,
  /*limits: {
      fileSize: 1024 * 1024 * 5
  }*/
})
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
router.post("/menus", (req, res) => {

  //Ejemplo de validacion
  var data = req.body;
  data ["registerdate"] = new Date();
  var newmenus = new Menus(data);
  newmenus.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newmenus,
      "id" : rr._id,
      "msn" :  "menu  agregado con exito"
    });
  });
});
router.get("/menus",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Menus.find({}).skip(skip).limit(limit).exec((err, docs) => {
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

router.get(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Menus.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(400).json({
      "respuesta":400,
      "msn" : "No existe el recurso seleccionado "
    });
  })
});

router.delete('/menus/:id', (req, res,) => {
  var idMenus = req.params.id;

  Menus.findByIdAndRemove(idMenus).exec()
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

router.patch("/menus",(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["nombre", "precio", "descripcion", "foto"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  Menus.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    res.status(200).json({
      "resp": 200,
      "dato": menus,
      "msn" :  "Menus  editado con exito"
    });
    return;

  });
});
//Actualiza los datos del restaurant
router.put(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'precio', 'descripcion'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "nose puede actualizar error  utilice el formato patch"
    });
    return;
  }

  var menus = {
    restaurant : req.body.restaurant,
    nombre : req.body.nombre,
    precio : req.body.precio,
    descripcion : req.body.descripcion,
    foto : req.body.foto

  };
  Menus.findOneAndUpdate({_id: id}, menus, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "No se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": menus,
        "msn" :  "menus  editado con exito"
      });
      return;
  });
});

/*
*/
//insertar datos de orden
router.post("/orden",  (req, res) => {


  var data = req.body;
  data ["registerdate"] = new Date();
  var neworden = new Orden(data);
  neworden.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": neworden,
      "msn" :  "orden  agregado con exito"
    });
  });
});
router.get("/orden", (req, res, next) =>{
  Orden.find({}).populate("menus").populate("cliente").populate("restaurant").exec((error, docs) => {
    res.status(200).json(docs);
  });
});

// Read only one user
router.get(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Orden.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({

        "array_texto":
          {
            "texto":"<b>orden</b>",
            "texto":"registrado con exito"
          }


    });
  })
});
//elimina una orden
router.delete('/orden/:id', (req, res,) => {
  var idOrden = req.params.id;

  Orden.findByIdAndRemove(idOrden).exec()
      .then(() => {
          res.json({
              message: "orden eliminado"
          });
      }).catch(err => {
          res.status(500).json({
              error: err
          });
      });


});
//Actualizar solo x elementos
router.patch(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var orden = {};
  for (var i = 0; i < keys.length; i++) {
    orden[keys[i]] = req.body[keys[i]];
  }
  console.log(orden);
  Orden.findOneAndUpdate({_id: id}, orden, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;
  });
});
//Actualiza los datos dela ordem
router.put(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['idmenu', 'idrestaurant', 'cantidad', 'idcliente', 'lat', 'lon', 'pagototal'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var orden = {
    menu : req.body.idmenu,
    restaurant : req.body.idrestaurant,
    cliente : req.body.idcliente,
    lugar_envio : req.body.lugar_envio,
    cantidad : req.body.cantidad,
    precio : req.body.precio,
    pagototal : req.body.pagototal
  };
  Orden.findOneAndUpdate({_id: id}, orden, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos de la orden"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;
  });
});
/* 

*/
//insertar datos de] menu
router.post("/detalle",  (req, res) => {

  //Ejemplo de validacion
  var data = req.body;
  data ["registerdate"] = new Date();
  var newdetalle = new Detalle(data);
  newdetalle.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newrestaurant,
      "id" : rr._id,
      "msn" :  "pedidos agregado con exito"
    });
  });
});
router.get("/pedidos",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Pedidos.find({}).skip(skip).limit(limit).exec((err, docs) => {
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



//mostrar  por id detalle
router.get(/pedidos\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Pedidos.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.json({
      result : docs    });
  })
});
//elimina un restaurant
router.delete('/detalle/:id',  (req, res, )=> {
  var idDetalle = req.params.id;

  Orden.findByIdAndRemove(idOrden).exec()
      .then(() => {
          res.json({
              message: "Orden eliminado"
          });
      }).catch(err => {
          res.status(500).json({
              error: err
          });
      });


});
//Actualizar solo x elementos
router.patch(/pedidos\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var pedidos = {};
  for (var i = 0; i < keys.length; i++) {
    pedidos[keys[i]] = req.body[keys[i]];
  }
  console.log(restaurant);
  Pedidos.findOneAndUpdate({_id: id}, pedidos, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }

      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;

      });
  });
});

module.exports = router;