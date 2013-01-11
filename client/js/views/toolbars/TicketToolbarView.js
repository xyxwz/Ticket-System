/**
 * View Dependencies
 */

define([
  'jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/toolbars/TicketToolbar.html'],
  function($, _, Backbone, BaseView, mustache, ToolbarTmpl) {

  /**
   * Ticket details toolbar
   * facilitates in ticket actions
   *
   * @param {Backbone.Model} model
   */

  var TicketToolbarView = BaseView.extend({
    className: 'ticket-sidebar',
    events: {
      "click [data-action]": "ticketAction"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(ToolbarTmpl, {
        isOpen: this.model.get('status') === 'open'
      }));

      return this;
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
    }
  });

  return TicketToolbarView;
});