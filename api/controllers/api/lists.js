module.exports = function(app) {
  var List = app.models.List;

  /**
   *  Lists
   *  GET /api/lists/
   *
   *  listID - The MongoDb BSON id converted to a string
   *  returns all lists
   */
  app.get('/api/lists', function(req, res) {
    List.mine(req.user._id, function(err, lists) {
      if(err) return res.json({ error: err }, 400);
      return res.json(lists, 200);
    });
  });


  /**
   *  Create a new List
   *  POST /api/lists/
   *
   *  body - A json object representing a list
   *
   *  returns the newly created list
   */
  app.post('/api/lists', function(req, res) {
    var data = req.body;
    data.user = req.user._id;

    List.create(data, function(err, model) {
      if(err) return res.json({error: err}, 400);
      return res.json(model, 201);
    });
  });


  /**
   *  Single `List`
   *  GET /api/lists/:listID
   *
   *  listID  - The MongoDb BSON ticket id converted to a string
   *
   *  returns a single list and associated data
   */
  app.get('/api/lists/:listID', function(req, res) {
    List.find(req.params.listID, function(err, model) {
      if(err) return res.json({ error: err }, 404);
      return res.json(model, 200);
    });
  });


  /**
   *  Update a `List`
   *  PUT /api/lists/:listID
   *
   *  listID   - The MongoDb BSON ticket id converted to a string
   *  body       - A json object representing a list
   *
   *  updates a list with the passed data
   */
  app.put('/api/lists/:listID', function(req, res) {
    var list = new List(req.list),
        data = req.body;

    list.update(data, function(err, model) {
      if(err) return res.json({ error: err }, 400);
      return res.json(model, 200);
    });
  });


  /**
   * Delete List
   * DELETE /api/lists/:listID
   *
   * listID  - The MongoDb BSON ticket id converted to a string
   *
   * removes a list from MongoDB
   */
  app.del('/api/lists/:listID', function(req, res) {
    var list = new List(req.list);

    list.remove(function(err, status) {
      if(err) return res.json({ error: "Error removing list" }, 400);
      res.json({ success: status });
    });
  });

};