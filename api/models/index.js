
module.exports = function requireModels(app){
  var models = {
    User: require('./user')(app),
    Ticket: require('./ticket')(app),
    Comment: require('./comment')(app),
  };

  return models;
}
