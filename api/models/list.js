var mongoose = require('mongoose'),
    _ = require('underscore'),
    ListSchema = require('./schemas/list').List;


module.exports = function(app) {

  function List(model) {
    this.model = model || new ListSchema();
  }

  /**
   * `List.update` update the current model with the given `data`
   *
   * @param {Object} data object of attributes to update
   * @param {Function} callback function invoked after the transaction
   */
  List.prototype.update = function(data, callback) {
    var ticketIds,
        list = this.model;

    if(data.name) list.name = data.name;

    if(data.tickets) {
      ticketIds = _.unique(data.tickets);
      list.tickets = ticketIds;
    }

    list.save(function(err, model) {
      if(err) return callback(err);

      app.eventEmitter.emit('list:update', model.toClient());
      return callback(null, model.toClient());
    });
  };

  /**
   * `List.remove` remove the current model
   *
   * @param {Function} callback function invoked after transaction
   */
  List.prototype.remove = function(callback) {
    var obj = this.model.toClient();

    this.model.remove(function(err) {
      if(err) return callback(err);

      app.eventEmitter.emit('list:remove', { id: obj.id });
      return callback(null, 'ok');
    });
  };

  /**
   * Static function create
   *
   * @param {Object} data
   */
  List.create = function(data, callback) {
    var list = new ListSchema({
      name: data.name,
      user: data.user,
      color: data.color
    });

    list.save(function(err, model) {
      if(err || !model) return callback(err);

      app.eventEmitter.emit('list:new', model.toClient());
      return callback(null, model.toClient());
    });
  };

  /**
   * Static function `List.all`
   * returns all lists
   *
   * @param {Function} callback
   */
  List.all = function(callback) {
    ListSchema.find({}, function(err, lists) {
      if(err) return callback(err);

      lists = lists.map(function(list) {
        return list.toClient();
      });
      return callback(null, lists);
    });
  };

  /**
   * Static function `List.find`
   * returns the list with id `id`
   *
   * @param {String} id objectid of the record to return
   * @param {Function} callback
   */
  List.find = function(id, callback) {
    ListSchema.findById(id, function(err, model) {
      if(err || !model) return callback(err);
      return callback(null, model.toClient());
    });
  };

  /**
   * Static function `List.mine`
   * returns the lists with owned by user, `userID`
   *
   * @param {Function} callback function invoked after the transaction
   */
  List.mine = function(userID, callback) {
    ListSchema.find({ user: userID }, function(err, models) {
      if(err) return callback(err);

      models = models.map(function(model) {
        return model.toClient();
      });

      return callback(null, models);
    });
  };


  return List;
};