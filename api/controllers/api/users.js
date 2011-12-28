var mongoose = require('mongoose'),
    User = mongoose.model('User');

module.exports = function(app) {

  /* User Index
  *  GET /api/users.json
  *
  *  returns a list of all the users in the database */
  app.get('/api/users.json', function(req, res) {
    User.getAll(function(err, users){
      if(err) return res.json({error: 'Error getting users'}, 400);
      res.json(users);
    });
  });
  
  
  /* Create a new user
  *  POST /api/users.json
  *
  *  body - A json object representing a user
  *        :email      - string
  *        :name       - string in format "first last"
  *        :department - string, used to determine permissions
  *
  *  adds a user to the database */
  app.post('/api/users.json', function(req, res) {
    var data = req.body;
    User.create(data, function(err, model) {
      if(err) return res.json({error: 'Missing required attributes'}, 400);
      res.json(model, 201);
    });
  });
  
  
  /* User Info
  *  GET /api/users/:userID.json
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  returns a single user */
  app.get('/api/users/:userID.json', function(req, res) {
    res.json(req.user.toClient());
  });
  
  
  /* Update a user
  *  PUT /api/users/:userID.json
  *
  *  userID   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :email      - string
  *        :name       - string in format "first last"
  *        :department - string, used to determine permissions
  *
  *  updates the user instance with the passed in attributes */
  app.put('/api/users/:userID.json', function(req, res) {
    var data = req.body;
    var user = req.user;
    user.update(data, function(err, model) {
      if(err) return res.json({error: 'Error updating user'});
      res.json(model);
    });
  });
  
  
  /* Delete a user
  *  DELETE /api/users/:userID.json
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  removes a user from the database */
  app.del('/api/users/:userID.json', function(req, res) {
    var user = req.user;
    user.removeUser(function(err, status) {
      if(err) return res.json({error: 'Error removing user'});
      res.json({success: "ok"});
    });
  });
  
};
