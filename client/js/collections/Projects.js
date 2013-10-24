define([
  'underscore',
  'backbone',
  'models/Project'
], function(_, Backbone, Project) {
  var Projects;

  /**
   * Projects collection, a global collection of ticket groupings
   */

  Projects = Backbone.Collection.extend({
    model: Project,
    url: '/api/projects',

    initialize: function() {
      ticketer.EventEmitter.on('project:new', this.addProject);
      ticketer.EventEmitter.on('project:update', this.updateProject);
      ticketer.EventEmitter.on('project:remove', this.removeProject);
    },

    getProjectTickets: function(model) {
      var project = this.get(model.id);

      return project.get('tickets');
    },

    addProject: function(model) {
      var project = this.get(model.id);

      if(!project) {
        this.add(model);
      }
    },

    updateProject: function(model) {
      var project = this.get(model.id);

      if(!project) {
        this.add(model);
      }
      else {
        if(model.description) project.set({ description: model.description });
        if(model.name) project.set({ title: model.name });
        if(model.tickets) project.set({ tickets: model.tickets });
      }
    },

    removeProject: function(obj) {
      var model = this.get(obj.id);

      if(model) model.destroy();
    }
  });

  return Projects;
});