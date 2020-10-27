const mongoose = require("mongoose");
mongoose.connect("mongodb://192.168.1.15:27017/restaurantapp", {
  useNewUrlParser: true
}).then(()=>{
  console.log('connexion a mongodb existosa');
}).catch(err => {
  console.log('error en la connexion', err);
});

module.exports = mongoose;