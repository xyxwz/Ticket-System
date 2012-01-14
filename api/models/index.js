
module.exports = function requireModels(app){
  var models = {
    users: require('./User')(app),
    tickets: require('./Ticket')(app),
  };

  return models;
}
