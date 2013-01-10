/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/tasks/TaskDetailsView'],
function($, _, mustache, BaseView, HeaderView, View) {

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
        title: 'Task Details',
        route: 'tasks/new'
      });

      primary = this.createView(View, this.options);

      this.$el.html(header.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TaskListView;
});