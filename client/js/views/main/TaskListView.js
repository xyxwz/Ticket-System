/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/tasks/TaskListView'],
function($, _, mustache, BaseView, HeaderView, ListView) {

  /**
   * The main view for task lists
   */

  var TaskListView = BaseView.extend({
    className: "container",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var header, primary;

      header = this.createView(HeaderView, {
        title: 'Tasks',
        route: 'tasks/new'
      });

      primary = this.createView(ListView, this.options);

      this.$el.html(header.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TaskListView;
});