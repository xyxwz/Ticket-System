var mongoose = require("mongoose");

var Comment = new mongoose.Schema({
  comment           : {type : String, required: true, trim: true},
  created_at        : {type : Date, default : Date.now, index: true, required: true},
  modified_at       : {type : Date},
  user              : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

exports.CommentSchema = Comment;
exports.Comment = mongoose.model('Comment', Comment);
