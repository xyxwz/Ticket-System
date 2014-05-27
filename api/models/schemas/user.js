var mongoose = require("mongoose");

var User = new mongoose.Schema({
  username      : {type: String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type: String, default: '', required: true, trim: true},
  role          : {type: String, default: '', required: true, trim: true,
                   enum: ['admin', 'member', 'read']},
  active        : {type: Boolean, default: true, required: true},
  created_at    : {type: Date,   default: Date.now, required: true},
  access_token  : {type: String, required: true, trim: true},
  avatar        : {type: String, trim: true},
  settings      : {
    email: {type: Boolean, default: false},
    desktop: {type: Boolean, default: true},
    inverseComments: {type: Boolean, default: false}
  }
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
    role: obj.role,
    avatar: obj.avatar,
    settings: obj.settings
  };

  return user;
};


exports.User = mongoose.model('User', User);
