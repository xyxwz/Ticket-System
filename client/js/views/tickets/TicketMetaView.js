/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/tickets/TicketAssignView',
  'views/tickets/TicketTagView'],
function($, _, mustache, BaseView, TicketAssign, TagView) {

  /**
   * TicketMetaView
   * render a tickets meta data
   *
   * @param {Backbone.Model} model
   */

  var TicketMetaView = BaseView.extend({
    className: 'ticket-meta',

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

      view = this.createView(TagView, {
        model: this.model
      });

      this.$el.append(view.render().el);
    }

  });

  return TicketMetaView;
});