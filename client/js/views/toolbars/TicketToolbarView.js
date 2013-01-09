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

    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(ToolbarTmpl));
      return this;
    },

    show: function(e) {
      e.preventDefault();
      this.$el.show();
    },

    hide: function(e) {
      e.preventDefault();
      this.$el.hide();
    }
  });

  return TicketToolbarView;
});