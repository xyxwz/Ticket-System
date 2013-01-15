/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/tickets/TicketAssignView',
  'views/tickets/TicketTagListView'],
function($, _, mustache, BaseView, TicketAssign, TagWidget) {

  /**
   * TicketMetaView
   * render a tickets meta data
   *
   * @param {Backbone.Model} model
   */

  var TicketMetaView = BaseView.extend({
    className: 'ticket-meta',

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.renderAssignView();
      this.renderTagWidget();

      return this;
    },

    renderAssignView: function() {
      var view;

      view = this.createView(TicketAssign, {
        model: this.model
      });

      this.$el.append(view.render().el);
    },

    renderTagWidget: function() {
      var view;

      view = this.createView(TagWidget, {
        model: this.model
      });

      this.$el.append(view.render().el);
    }

  });

  return TicketMetaView;
});