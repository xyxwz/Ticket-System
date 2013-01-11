/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/toolbars/widgets/Widget.html',
  'text!templates/toolbars/widgets/Task.html'],
function($, _, Backbone, BaseView, mustache, WidgetTmpl, TaskTmpl) {

  /**
   * Widget to help with task assignment selection
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection tasks to search from
   */

  var TaskWidgetView = BaseView.extend({
    tagName: 'li',
    className: 'widget',
    events: {
      "focus [data-action='assign']": "bindEvents",
      "blur [data-action='assign']": "unbindEvents",
      "click [data-role='results-list'] li": "assignTask",
      "click .task [data-action='remove']": "unassignTask"
    },

    initialize: function() {
      _.bindAll(this);
      this.$el.attr('data-role', 'task-widget');
    },

    render: function() {
      this.$el.html(Mustache.to_html(WidgetTmpl, {
        placeholder: "Assign Task..."
      }));

      this.renderAssignedTasks();
      return this;
    },

    /**
     * Render all tasks assigned to `this.model`
     */

    renderAssignedTasks: function() {
      var self = this,
          element = $('[data-role="assigned-objects"]', this.$el);

      if(element.length) {
        element.empty();
      }

      this.collection.each(function(task) {
        if(~task.get('tickets').indexOf(self.model.id)) {
          task = task.toJSON();
          task.isRemovable = true;
          element.append(self.renderTask(task));
        }
      });
    },

    /**
     * Return the rendered html for one task object
     *
     * @param {Object} task
     * @return {String}
     */

    renderTask: function(task) {
      return Mustache.to_html(TaskTmpl, task);
    },

    /**
     * Render a filtered results list
     *
     * @param {jQuery.Event} e
     */

    renderFilteredResults: function(e) {
      var val = $(e.currentTarget).val(),
          element = $('[data-role="results-list"]', this.$el);

      // There must be something to worth searching for...
      if(val.replace(/\s+/g, '').length) {
        element.html(this.filterTasks(val)).fadeIn(400);
      }
      else {
        element.empty();
      }
    },

    /**
     * Filter tasks by the given `input` and return the rendered html
     *
     * @param {String} input
     * @return {String}
     */

    filterTasks: function(input) {
      var self= this,
          results = [];

      this.collection.each(function(task) {
        var name = task.get('name').toLowerCase();

        // task.name contains input and is not already added
        if(~name.indexOf(input) &&
            !~task.get('tickets').indexOf(self.model.id)) {
          results.push(self.renderTask(task.toJSON()));
        }
      });

      // List up to 4 results
      return results.slice(0, 4).join('');
    },

    /**
     * Bind events on `focus` of the input field
     *
     * @param {jQuery.Event} e
     */

    bindEvents: function(e) {
      var element = $(e.currentTarget);
      this.bindTo(element, 'keyup', this.renderFilteredResults);
    },

    /**
     * Unbind previously bound events on `blur`
     *
     * @param {jQuery.Event} e
     */

    unbindEvents: function(e) {
      var element = $(e.currentTarget);
      this.unbind('keyup');

      $('[data-role="results-list"]', this.$el).fadeOut(200, function() {
        $(this).empty();
        element.val('');
      });
    },

    /**
     * Assigns the clicked results-list item to `this.model`
     *
     * @param {jQuery.Event} e
     */

    assignTask: function(e) {
      var id = $(e.currentTarget).data('id');

      e.preventDefault();
      this.collection.get(id).addTicket(this.model.id);
      this.renderAssignedTasks(); // Manually call a re-render
    },

    /**
     * Unassigns the clicked task list item from `this.model`
     *
     * @param {jQuery.Event} e
     */

    unassignTask: function(e) {
      var id = $(e.currentTarget).parent().data('id');

      e.preventDefault();
      this.collection.get(id).removeTicket(this.model.id);
      this.renderAssignedTasks(); // Manually call a re-render
    }
  });

  return TaskWidgetView;
});