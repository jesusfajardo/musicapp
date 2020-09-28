var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',(req, res, next) => {
  var datos = req.query;
  var name = datos.name;
  console.log(datos);
  console.log(name);
  res.status(200).json ({
    msn:"HOLA MUNDO"
  });
});
router.post("/usuario",(req, res) =>{
  var datos = req.body;
  console.log(datos);
  res.status(200).json(datos);


});
req.body["msn"] = "Por el servidor";
var data = req.body
res.status(200).json(data);

module.exports = router;
