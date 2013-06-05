var User;

module.exports = function(app) {

  User = app.models.User;

  /* User Index
  *  GET /api/users
  *
  *  returns a list of all the users in the database */
  app.get('/api/users', function(req, res) {
    User.all(function(err, users){
      if(err) return res.json({error: 'Error getting users'}, 400);
      res.json(users);
    });
  });


  /* Create a new user
  *  POST /api/users
  *
  *  body - A json object representing a user
  *        :email      - string
  *        :name       - string in format "first last"
  *        :role       - string, used to determine permissions
  *
  *  adds a user to the database */
  app.post('/api/users', function(req, res) {
    var data = req.body;
    User.create(data, function(err, model) {
      if(err) return res.json({error: 'Missing required attributes'}, 400);
      res.json(model, 201);
    });
  });


  /* User Info
  *  GET /api/users/:userID
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  returns a single user */
  app.get('/api/users/:userID', function(req, res) {
    res.json(req.user.toClient());
  });


  /* Update a user
  *  PUT /api/users/:userID
  *
  *  userID   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :email      - string
  *        :name       - string in format "first last"
  *        :role       - string, used to determine permissions
  *
  *  updates the user instance with the passed in attributes */
  app.put('/api/users/:userID', function(req, res) {
    var data, user;

    data = req.body;
    user = new User(req.user);
    user.update(data, function(err, model) {
      if(err) return res.json({error: 'Error updating user'}, 400);
      res.json(model);
    });
  });


  /* Delete a user
  *  DELETE /api/users/:userID
  *
  *  userID - The MongoDb BSON id converted to a string
  *
  *  removes a user from the database */
  app.del('/api/users/:userID', function(req, res) {
    var user = new User(req.user);
    user.remove(function(err, status) {
      if(err) return res.json({error: 'Error removing user'}, 400);
      res.json({success: "ok"});
    });
  });

};
