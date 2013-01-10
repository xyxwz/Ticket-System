/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache', 'text!templates/tasks/TaskForm.html'],
function($, _, Backbone, BaseView, mustache, TaskForm) {

  /**
   * Render the task creation form
   *
   * @param {Backbone.Collection} collection
   */

  var TaskFormView = BaseView.extend({
    className: 'task-form',

    events: {
      "click [data-action='create']": "create",
      "click [data-action='cancel']": "back"
    },

    initialize: function() {
      _.bindAll(this);
      this.bindTo(this.collection, 'sync', this.redirect);
    },

    render: function() {

      $(this.el).html(Mustache.to_html(TaskForm));
      return this;
    },

    create: function(e) {
      e.preventDefault();

      var title = $('[name=title]', this.el).val();
      this.collection.create({title: title}, {wait: true});
    },

    redirect: function(model) {
      this.dispose();
      window.history.replaceState({}, document.title, "#tasks/");
      ticketer.routers.ticketer.navigate("tasks/" + model.id, true);
    },

    back: function(e) {
      e.preventDefault();
      this.dispose();
      window.history.back();
    }

  });

  return TaskFormView;

});