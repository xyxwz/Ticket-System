var mongoose = require('mongoose'),
    redis = require('redis'),
    fs = require('fs'),
    _ = require('underscore'),
    async = require('async'),
    TemplateSchema = require('./schemas/template').Template;

module.exports = function(app) {


  function Template (model) {
    this.model = model || new TemplateSchema();
    this.redis = app.redis;
  }


  /**
   *  remove
   *
   *  Removes a template from the database.
   *
   *  Returns an error or status "ok" to the callback
   *
   *  @api public
   */

  Template.prototype.remove = function remove(cb) {
    var self = this,
        template = this.model,
        templateID = template.id;

    template.remove(function(err) {
      if (err) return cb(err);

      return cb(null);
    });
  };


  /**
   * ----------------------------------------
   * Static Methods
   * ----------------------------------------
   */


  /**
   *  all
   *
   *  Gets a list of all the template in the database.
   *
   *  Returns an Array ready to be sent to the client.
   *
   *  @api public
   */

  Template.all = function all(cb) {
    var array = [];

    TemplateSchema.find().exec(function(err, models) {
      if(err) {
        return cb(new Error("Error finding templates"));
      }
      else {
        _.each(models, function(template) {
          array.push(template.toClient());
        });

        return cb(null, array);
      }
    });
  };


  /**
   *  find
   *
   *  Retrieves a single template model by id.
   *
   *  :id - string, a templates BSON id
   *
   *  Return a single template object ready to be sent to the client
   *
   *  @api public
   */

  Template.find = function find(id, cb) {
    var _this, obj;

    TemplateSchema
    .findOne({'_id':id})
    .exec(function(err, model) {
      if(err || !model){
        return cb("Error finding template");
      }
      else {
        obj = new Template(model);

        obj._toClient(function(err, template){
          if(err) return cb(err);
          return cb(null, template);
        });
      }
    });
  };


  /**
   *  create
   *
   *  Creates a new template
   *
   *  @data - A json object representing template properties
   *     :title       - string
   *     :description - string, remove any possible script tags
   *
   *  Returns a template object ready to be sent to the client.
   *
   *  @api public
   */

  Template.create = function create(data, cb) {
    var template;

    template = new TemplateSchema({
      title: data.title,
      description: data.description,
    });

    template.save(function(err, model) {
      if (err || !model) return cb(err);
      return cb(null, model);
    });
  };

  return Template;

};

