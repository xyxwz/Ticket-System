/* TicketView
 * Renders a single Ticket
 */

define(['jquery', 'underscore', 'backbone', 'garbage', 'mustache', 'text!templates/tickets/Ticket.html'],
function($, _, Backbone, BaseView, mustache, ticket) {

  var TicketView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    initialize: function() {
      _.bindAll(this);

      // Bindings using the garbage collectors bindTo()
      this.bindTo(this.model.comments, 'add', this.updateCommentCount);
    },

    render: function() {
      // Add comments length from model object to
      // data attributes
      var data = this.model.toJSON();
      data.comments = this.model.comments.length;
      $(this.el).html(Mustache.to_html(ticket, data));
      return this;
    },

    updateCommentCount: function() {
      $('.commentCount', this.el).html(this.model.comments.length);
    },

  });

  return TicketView;
});