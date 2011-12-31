/* TicketListView
 * Renders a collection of Tickets
 */

define(['jquery', 'underscore', 'backbone', 'views/tickets/TicketView'], 
function($, _, Backbone, TicketView) {

  var TicketListView = Backbone.View.extend({
    el: $('#main'),

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var collection = this.collection,
          self = this;

      _.each(collection.models, function(ticket) {
        var view = new TicketView({
          model: ticket,
        });
        $(self.el).append(view.render().el);
      });
    },

  });

  return TicketListView;
 });