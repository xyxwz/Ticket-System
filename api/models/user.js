var mongoose = require("mongoose");

var User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type : String, default : '', required: true, trim: true},
  department    : {type : String, default : '', required: true, trim: true,
                   enum: ['IT', 'K12']},
  created       : {type : Date,   default : Date.now, required: true}
});

User.method('toClient', function(){
  obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
})

mongoose.model('User', User);