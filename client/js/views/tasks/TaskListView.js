/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/tasks/TaskView'],
function($, _, Backbone, BaseView, TaskView) {

  /**
   * TaskListView
   * Renders a collection of Tasks
   *
   * @param {Backbone.Collection} collection
   */

  var TaskListView = BaseView.extend({
    className: 'task-list scrollable',
    events: {
      "click .task": "showDetails"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection, 'reset', this.render);
    },

    render: function() {
      this.$el.empty();
      this.collection.each(this.renderTask);

      return this;
    },

    /**
     * Render an individual list view
     */
    renderTask: function(model) {
      var view = this.createView(TaskView, {
        model: model
      });

      this.$el.append(view.render().el);
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).data('id');
      ticketer.routers.ticketer.navigate("tasks/" + id, true);
    }
  });

  return TaskListView;
});