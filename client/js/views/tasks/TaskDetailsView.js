/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/tasks/TaskView',
  'views/tickets/TicketListView'],
function($, _, mustache, BaseView, TaskView, TicketListView) {

  /**
   * TaskView
   * render a single Task's details
   *
   * @param {Backbone.Model} model
   */

  var TaskDetailsView = BaseView.extend({
    className: 'task-details',
    events: {
    },

    initialize: function() {
      _.bindAll(this);

      this.$el.attr('data-id', this.model.id);
      return this;
    },

    render: function() {
      var task,
          tickets,
          self = this;

      task = this.createView(TaskView, this.options);

      tickets = this.createView(TicketListView, {
        collection: ticketer.collections.openTickets,
        filter: function(ticket) {
          return ~self.model.get('tickets').indexOf(ticket.id);
        }
      });

      this.$el.html(task.render().el);
      this.$el.append(tickets.render().el);

      return this;
    }
  });

  return TaskDetailsView;
});