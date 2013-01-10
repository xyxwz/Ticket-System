/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/tasks/Task.html'],
function($, _, mustache, BaseView, TaskTmpl) {

  /**
   * TaskView
   * render a single Task
   *
   * @param {Backbone.Model} model
   */

  var TaskView = BaseView.extend({
    className: 'task',
    events: {
    },

    initialize: function() {
      _.bindAll(this);

      this.$el.attr('data-id', this.model.id);
      return this;
    },

    render: function() {
      this.$el.html(Mustache.to_html(TaskTmpl, this.model.toJSON()));
      $('time', this.el).timeago();

      return this;
    }
  });

  return TaskView;
});