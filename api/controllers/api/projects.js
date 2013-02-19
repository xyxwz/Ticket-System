module.exports = function(app) {
  var Project = app.models.Project;

  /**
   *  Projects
   *  GET /api/projects/
   *
   *  projectID - The MongoDb BSON id converted to a string
   *  returns all projects
   */
  app.get('/api/projects', function(req, res) {
    Project.all(function(err, projects) {
      if(err) return res.json({ error: err }, 400);
      return res.json(projects, 200);
    });
  });


  /**
   *  Create a new Project
   *  POST /api/projects/
   *
   *  body - A json object representing a project
   *
   *  returns the newly created project
   */
  app.post('/api/projects', function(req, res) {
    var data = req.body;
    data.user = req.user._id;

    Project.create(data, function(err, model) {
      if(err) return res.json({error: err}, 400);
      return res.json(model, 201);
    });
  });


  /**
   *  Single `Project`
   *  GET /api/projects/:projectID
   *
   *  projectID  - The MongoDb BSON ticket id converted to a string
   *
   *  returns a single project and associated data
   */
  app.get('/api/projects/:projectID', function(req, res) {
    Project.find(req.params.projectID, function(err, model) {
      if(err) return res.json({ error: err }, 404);
      return res.json(model, 200);
    });
  });


  /**
   *  Update a `Project`
   *  PUT /api/projects/:projectID
   *
   *  projectID   - The MongoDb BSON ticket id converted to a string
   *  body       - A json object representing a project
   *
   *  updates a project with the passed data
   */
  app.put('/api/projects/:projectID', function(req, res) {
    var project = new Project(req.project),
        data = req.body;

    project.update(data, function(err, model) {
      if(err) return res.json({ error: err }, 400);
      return res.json(model, 200);
    });
  });


  /**
   * Delete Project
   * DELETE /api/projects/:projectID
   *
   * projectID  - The MongoDb BSON ticket id converted to a string
   *
   * removes a project from MongoDB
   */
  app.del('/api/projects/:projectID', function(req, res) {
    var project = new Project(req.project);

    project.remove(function(err, status) {
      if(err) return res.json({ error: "Error removing project" }, 400);
      res.json({ success: status });
    });
  });

};