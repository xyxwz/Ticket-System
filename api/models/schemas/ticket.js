var mongoose = require("mongoose"),
    CommentSchema = require('./comment').CommentSchema,
    _ = require('underscore');

var Ticket = new mongoose.Schema({
  status                : {type : String, default : 'open', enum: ['open', 'closed'], index: true, required: true},
  title                 : {type : String, default : '', required: true, trim: true},
  description           : {type : String, default : '', required: true, trim: true},
  opened_at             : {type : Date, default : Date.now, index: true, required: true},
  closed_at             : {type : Date, index: true},
  modified_at           : {type : Date},
  user                  : {type : mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true},
  comments              : [CommentSchema],
});

exports.Ticket = mongoose.model('Ticket', Ticket);
