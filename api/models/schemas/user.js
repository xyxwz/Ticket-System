var mongoose = require("mongoose");

var User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type : String, default : '', required: true, trim: true},
  role          : {type : String, default : '', required: true, trim: true,
                   enum: ['admin', 'member']},
  created_at    : {type : Date,   default : Date.now, required: true},
  access_token  : {type : String, trim: true, index: true}
});

/**
 * To Client
 *
 *  Returns an object for use with client-side js.
 *  Sets the mongo _id property name to id
 */

User.methods.toClient = function(){
  var obj, user;

  obj = this.toObject();
  obj.id = obj._id;

  user = {
    id: obj.id,
    name: obj.name,
    role: obj.role
  }

  return user;
}


exports.User = mongoose.model('User', User);