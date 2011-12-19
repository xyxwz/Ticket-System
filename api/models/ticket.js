var mongoose = require("mongoose");
var util = require("util");

var Comment = new mongoose.Schema({
  comment           : {type : String, default : '', required: true, trim: true},
  created           : {type : Date, default : Date.now(), required: true},
  modified          : {type : Date, default : Date.now, set: Date.now, required: true},
  user              : {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
});

var Ticket = new mongoose.Schema({
  status                : {type : String, default : 'open', enum: ['Open', 'Closed'], required: true},
  title                 : {type : String, default : '', required: true, trim: true},
  description           : {type : String, default : '', required: true, trim: true},
  opened_at             : {type : Date, default : Date.now(), required: true},
  closed_at             : {type : Date},
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