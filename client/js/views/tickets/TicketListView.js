/* TicketListView
 * Renders a collection of Tickets
 */

define(['jquery', 'underscore', 'backbone','views/tickets/TicketView'],
function($, _, Backbone, TicketView) {

  var TicketListView = Backbone.View.extend({
    el: $('<div id="ticketList"></div>'),

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      _.bindAll(this);
      $(this.el).html(''); // clear out content
    },

    render: function() {
      this.addAll();

      return this;
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

  return TicketListView;
 });