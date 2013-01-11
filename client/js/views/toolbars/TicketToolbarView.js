/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/toolbars/TicketToolbar.html',
  'views/toolbars/widgets/UserWidgetView',
  'views/toolbars/widgets/TaskWidgetView'],
function($, _, Backbone, BaseView, mustache,
  ToolbarTmpl, UserWidget, TaskWidget) {

  /**
   * Ticket details toolbar
   * facilitates in ticket actions
   *
   * @param {Backbone.Model} model
   */

  var TicketToolbarView = BaseView.extend({
    className: 'ticket-sidebar scrollable',
    events: {
      "click a[data-action]": "ticketAction"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(ToolbarTmpl, {
        isOpen: this.model.get('status') === 'open'
      }));

      this.renderWidgets();
      return this;
    },

    renderWidgets: function() {
      var userWidget, taskWidget,
          element = $('[data-role="widget-container"]', this.$el);

      userWidget = this.createView(UserWidget, {
        collection: ticketer.collections.admins,
        model: this.model
      });

      taskWidget = this.createView(TaskWidget, {
        collection: ticketer.collections.lists,
        model: this.model
      });

      element.append(taskWidget.render().el);
      element.append(userWidget.render().el);
    },

    ticketAction: function(e) {
      var action = $(e.currentTarget).data('action'),
          request = "Delete this ticket? This cannot be undone";

      switch(action) {
        case 'close':
          this.model.close();
          break;
        case 'edit':
          this.model.trigger('edit');
          break;
        case 'delete':
          var resp = confirm(request);
          if(resp) this.model.destroy();
          break;
      }

      e.preventDefault();
    }
  });

  return TicketToolbarView;
});