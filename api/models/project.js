var mongoose = require('mongoose'),
    _ = require('underscore'),
    ProjectSchema = require('./schemas/project').Project;


module.exports = function(app) {

  function Project(model) {
    this.model = model || new ProjectSchema();
  }

  /**
   * `Project.update` update the current model with the given `data`
   *
   * @param {Object} data object of attributes to update
   * @param {Function} callback function invoked after the transaction
   */
  Project.prototype.update = function(data, callback) {
    var ticketIds,
        project = this.model;

    if(data.name) project.name = data.name;
    if(data.description) project.description = data.description;

    if(data.tickets) {
      ticketIds = _.unique(data.tickets);
      project.tickets = ticketIds;
    }

    project.save(function(err, model) {
      if(err) return callback(err);

      app.eventEmitter.emit('project:update', model.toClient());
      return callback(null, model.toClient());
    });
  };

  /**
   * `Project.remove` remove the current model
   *
   * @param {Function} callback function invoked after transaction
   */
  Project.prototype.remove = function(callback) {
    var obj = this.model.toClient();

    this.model.remove(function(err) {
      if(err) return callback(err);

      app.eventEmitter.emit('project:remove', {id: obj.id });
      return callback(null, 'ok');
    });
  };


  /**
   * Static function create
   *
   * @param {Object} data
   */
  Project.create = function(data, callback) {
    var project = new ProjectSchema({
      name: data.name,
      user: data.user,
      description: data.description
    });

    project.save(function(err, model) {
      if(err || !model) return callback(err);

      var obj = model.toClient();
      if(data.socket) obj.socket = data.socket;

      app.eventEmitter.emit('project:new', obj);
      return callback(null, model.toClient());
    });
  };

  /**
   * Static function `Project.all`
   * returns all projects
   *
   * @param {Function} callback
   */
  Project.all = function(callback) {
    ProjectSchema.find({}, function(err, projects) {
      if(err) return callback(err);

      projects = projects.map(function(project) {
        return project.toClient();
      });
      return callback(null, projects);
    });
  };

  /**
   * Static function `Project.find`
   * returns the project with id `id`
   *
   * @param {String} id objectid of the record to return
   * @param {Function} callback
   */
  Project.find = function(id, callback) {
    ProjectSchema.findById(id, function(err, model) {
      if(err || !model) return callback(err);
      return callback(null, model.toClient());
    });
  };

  /**
   * Static function `Project.mine`
   * returns the projects with owned by user, `userID`
   *
   * @param {Function} callback function invoked after the transaction
   */
  Project.mine = function(userID, callback) {
    ProjectSchema.find({ user: userID }, function(err, models) {
      if(err) return callback(err);

      models = models.map(function(model) {
        return model.toClient();
      });

      return callback(null, models);
    });
  };


  return Project;
};