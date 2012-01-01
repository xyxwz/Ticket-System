/* TicketDetailsView
 * Renders a ticket's details and comments
 */

define(['jquery', 'underscore', 'backbone',
'text!templates/headers/Back.html', 'views/tickets/TicketView'],
function($, _, Backbone, HeaderTmpl, TicketView) {

  var TicketDetailsView = Backbone.View.extend({
    el: $('<div id="ticketDetails"></div>'),

    events: {
      "click #ticketDetailsHeader li a": "navigateBack",
    },

    initialize: function() {
      _.bindAll(this);

      /* Unbind Add - Workaround fix
       * If a comment is added then the back button
       * is used, the view never unbinds the old add callback
       * and it is triggered multiple times adding multiple comments
       * to the view. There should be a better way of doing this */
      this.model.comments.unbind('add');

      $(this.el).html(''); // clear out content
    },

    render: function() {
      this.addHeader();
      this.renderTicket();
      this.renderComments();

      return this;
    },

    addHeader: function() {
      var header = $('<div id="ticketDetailsHeader"></div>').html(HeaderTmpl);
      $('header').html(header).fadeIn('fast');
    },

    renderTicket: function() {
      var ticketView = new TicketView({
        model: this.model,
      });
      $(this.el).html(ticketView.render().el);
    },

    renderComments: function() {
      var CommentListView = new ticketer.views.comments.index({
        collection: this.model.comments,
      });
      $(this.el).append(CommentListView.render().el);
    },

    navigateBack: function() {
      ticketer.routers.ticketer.navigate("tickets", true);
    },

  });

  return TicketDetailsView;
 });