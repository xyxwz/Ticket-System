var mongoose = require("mongoose");
var _ = require('underscore');

var User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type : String, default : '', required: true, trim: true},
  department    : {type : String, default : '', required: true, trim: true,
                   enum: ['IT', 'K12']},
  created       : {type : Date,   default : Date.now, required: true}
});

User.methods.toClient = function(){
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
}

User.statics.getAll = function(callback){
  this.find().run(function(err, models){
    if(err) return callback(err);
    var array = [];
    _.each(models, function(user) {
      var obj = user.toClient();
      array.push(obj);
    });
    return callback(null, array);
  });
}

mongoose.model('User', User);