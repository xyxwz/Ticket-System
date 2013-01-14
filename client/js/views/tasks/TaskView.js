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

    initialize: function() {
      _.bindAll(this);

      this.$el.attr('data-id', this.model.id);
      return this;
    },

    render: function() {
      var data = this.model.toJSON();

      data.color = ticketer.colors[data.color].name;
      this.$el.html(Mustache.to_html(TaskTmpl, data));

      return this;
    }
  });

  return TaskView;
});