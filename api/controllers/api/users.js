var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('underscore');

module.exports = function(app) {
   
  /* User Index
  *  GET /users.json
  *
  *  returns a list of all the users in the database */
  app.get('/users.json', function(req, res) {
    User.getAll(function(err, users){
      if(err) return res.json({error: 'Error getting users'}, 400);
      res.json(users);
    });
  });
  
  
  /* Create a new user
  *  POST /users.json
  *
  *  body - A json object representing a user
  *        :email      - string
  *        :name       - string in format "first last"
  *        :department - string, used to determine permissions
  *
  *  adds a user to the database */
  app.post('/users.json', function(req, res) {
    var data = req.body;
    User.create(data, function(err, model) {
      if(err) return res.json({error: 'Missing required attributes'}, 400);
      res.json(model);
    });
  });
  
  
  /* User Info
  *  GET /users/:userID.json
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  returns a single user */
  app.get('/users/:userID.json', function(req, res) {
    res.json(req.user.toClient());
  });
  
  
  /* Update a user
  *  PUT /users/:userID.json
  *
  *  userID   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :email      - string
  *        :name       - string in format "first last"
  *        :department - string, used to determine permissions
  *
  *  updates the user instance with the passed in attributes */
  app.put('/users/:userID.json', function(req, res) {
    var data = req.body;
    var user = req.user;
    user.update(data, function(err, model) {
      if(err) return res.json({error: 'Error updating user'});
      res.json(model);
    });
  });
  
  
  /* Delete a user
  *  DELETE /users/:userID.json
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  removes a user from the database */
  app.del('/users/:userID.json', function(req, res) {
    var user = req.user;
    user.removeUser(function(err, status) {
      if(err) return res.json({error: 'Error removing user'});
      res.json({success: "ok"});
    });
  });


  /* ---------------------------------------------- *
   * Pre-conditions
   * ---------------------------------------------- */

  /* Find A User */
  app.param('userID', function(req, res, next, id){
    User
    .findOne({'_id':id})
    .run(function(err, user) {
      if(err || !user) return res.json({error: 'User not found'}, 404);
      req.user = user;
      next();
    });
  });
  
};
