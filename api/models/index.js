
module.exports = function requireModels(app){
  var models = {
    User: require('./User')(app),
    Ticket: require('./Ticket')(app),
    Comment: require('./Comment')(app),
  };

  return models;
}
