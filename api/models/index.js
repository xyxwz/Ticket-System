
module.exports = function requireModels(app){
  var models = {
    User: require('./user')(app),
    Ticket: require('./ticket')(app),
    Template: require('./template')(app),
    Comment: require('./comment')(app),
    Project: require('./project')(app),
    List: require('./list')(app)
  };

  return models;
};
