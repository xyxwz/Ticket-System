
module.exports = function requireModels(app){
  var models = {
    users: require('./User')(app),
  };

  return models;
}
