mongoose = require("mongoose")

User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true}
  name          : {type : String, default : '', required: true}
  department    : {type : String, default : '', required: true}
});

User.method('toClient', () ->
  obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  return obj
)

mongoose.model('User', User)