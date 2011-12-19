var mongoose = require("mongoose");
var util = require("util");

var Comment = new mongoose.Schema({
  comment           : {type : String, default : '', required: true},
  created           : {type : Date, default: Date.now(), required: true},
  user              : {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
});

var Ticket = new mongoose.Schema({
  status                : {type : String, default : 'open', required: true},
  title                 : {type : String, default : '', required: true},
  description           : {type : String, default : '', required: true},
  opened                : {type : Date, default : Date.now(), required: true},
  closed                : {type : Date},
  user                  : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  comments              : [Comment],
  participating_users   : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
  assigned_to           : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

Ticket.method('toClient', function(){
  obj = this.toObject();
  obj.id = obj._id;
  obj.user.id = obj.user._id;
  delete obj._id;
  delete obj.user._id;
  delete obj.comments;
  return obj;
});

mongoose.model('Comment', Comment);
mongoose.model('Ticket', Ticket);