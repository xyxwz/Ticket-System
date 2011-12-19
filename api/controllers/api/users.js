var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('underscore');

module.exports = function(app) {
   
  /* User Index
  *  GET /users.json
  *  returns a list of all the users in the database */
  app.get('/users.json', function(req, res) {
    User.getAll(function(err, users){
      if(err) {
        res.json({error: 'Error getting users'}, 400);
      }
      else {
        res.json(users);
      }
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
    var user = new User({
      email: data.email,
      name: data.name,
      department: data.department
    });
    user.save(function(err, model) {
      if (err || !model) {
        res.json({error: 'Missing required attributes'}, 400);
      } 
      else {
        res.json(model.toClient());
      }
    });
  });
  
  
  /* User Info
  *  GET /users/:id.json
  *
  *  id - The MongoDb BSON id converted to a string
  *
  *  returns a single user */
  app.get('/users/:id.json', function(req, res) {
    User
    .findOne({'_id': req.params.id})
    .run(function(err, user) {
      if (err || !user) {
        res.json({error: 'User not found'}, 404);
      } 
      else {
        res.json(user.toClient());
      }
    });
  });
  
  
  /* Update a user
  *  PUT /users/:id.json
  *
  *  id   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :email      - string
  *        :name       - string in format "first last"
  *        :department - string, used to determine permissions
  *
  *  updates the user instance with the passed in attributes */
  app.put('/users/:id.json', function(req, res) {
    var data = req.body;
    User
    .findOne({'_id': req.params.id})
    .run(function(err, user) {
      if (err || !user) {
        res.json({error: 'User not found'}, 404);
      } 
      else {
        if (data.email) user.email = data.email;
        if (data.name) user.name = data.name;
        if (data.department) user.department = data.department;
        user.save(function(err, model) {
          if (err || !model) {
            return res.json({error: 'Error updating model. Check required attributes.'}, 400);
          } 
          else {
            res.json(model.toClient());
          }
        });
      }
    });
  });
  
  
  /* Delete a user
  *  DELETE /users/:id.json
  *
  *  id - The MongoDb BSON id converted to a string
  *
  *  removes a user from the database */
  app.del('/users/:id.json', function(req, res) {
    User
    .findOne({'_id': req.params.id})
    .run(function(err, user) {
      if (err || !user) {
        res.json({error: 'User not found'}, 404);
      } 
      else {
        user.remove(function(err) {
          if (err) {
            res.json({error: 'Error removing user'}, 400);
          } 
          else {
            res.json({success: 'ok'});
          }
        });
      }
    });
  });
  
};
