
module.exports = function requireModels(app){
  var models = {
    users: require('./User')(app),
    tickets: require('./Ticket')(app),
    comments: require('./Comment')(app),
  };

  return models;
}
