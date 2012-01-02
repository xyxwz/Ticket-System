/* ClosedTicketListView
 * Renders a collection of Tickets with status of closed
 */

define(['jquery', 'underscore', 'backbone',
'text!templates/headers/FullHeader.html', 'views/tickets/TicketView'],
function($, _, Backbone, HeaderTmpl, TicketView) {

  var ClosedTicketListView = Backbone.View.extend({
    el: $('<div id="ticketList"></div>'),

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      _.bindAll(this);
      $(this.el).html(''); // clear out content
    },

    render: function() {
      this.addHeader();
      this.addAll();

      return this;
    },

    addHeader: function() {
      var header = $('<div id="ticketIndexHeader"></div>').html(HeaderTmpl);
      $('header').html(header).fadeIn('fast');
    },

    addAll: function() {
      var self = this;
      _.each(this.collection.models, function(ticket) {
        var view = new TicketView({
          model: ticket,
        });
        $(self.el).append(view.render().el);
      });
    },

    showDetails: function(e) {
      var id = e.currentTarget.id;
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return ClosedTicketListView;
 });