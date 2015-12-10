var mongoose = require("mongoose"),
    _ = require('underscore');

var Template = new mongoose.Schema({
  title                 : {type : String, default : '', required: true, trim: true},
  description           : {type : String, default : '', required: true, trim: true}
});

/**
 * To Client
 *
 *  Returns an object for use with client-side js.
 *  Sets the mongo _id property name to id
 */

Template.methods.toClient = function(){
  var obj, template;

  obj = this.toObject();
  obj.id = obj._id;

  template = {
    id: obj.id,
    title: obj.title,
    description: obj.description
  };

  return template;
};


exports.Template = mongoose.model('Template', Template);