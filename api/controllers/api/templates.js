var Template;

module.exports = function(app) {

  Template = app.models.Template;

  /* Template Index
  *  GET /api/templates
  *
  *  returns a list of all the templates in the database */
  app.get('/api/templates', function(req, res) {
    var args = {};

    if(req.query.title) args.title = req.query.title;
    if(req.query.description) args.description = req.query.description;

    Template.all(function(err, templates) {
      if(err) return res.json({error: 'Error getting templates'}, 400);
      res.json(templates);
    });
  });


  /* Create a new template
  *  POST /api/templates
  *
  *  body - A json object representing a template
  *        :title       - string
  *        :description - string
  *
  *  adds a template to the database */
  app.post('/api/templates', function(req, res) {
    var data = req.body;
    Template.create(data, function(err, template) {
      if(err) return res.json({error: 'Missing required attributes'}, 400);
      res.json(template, 201);
    });
  });

  /* Template Info
  *  GET /api/templates/:templateID
  *
  *  templateID - The MongoDb BSON id converted to a string
  *
  *  returns a single template
  */

  app.get('/api/templates/:templateID', function(req, res) {
    res.json(req.template.toClient());
  });


  /* Delete a template
  *  DELETE /api/templates/:templateID
  *
  *  templateID - The MongoDb BSON id converted to a string
  *
  *  removes a template from the database */
  app.del('/api/templates/:templateID', function(req, res) {
    var template;

    template = new Template(req.template);

    template.remove(function(err) {
      if(err) return res.json({error: 'Error removing template'}, 400);
      res.json({success: "ok"});
    });
  });

};
