/* TicketListView
 * Renders a collection of Tickets
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'timeline', 'views/tickets/TicketView'],
function($, _, Backbone, BaseView, Timeline, TicketView) {

  var TicketListView = BaseView.extend({

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var self = this;

      _.each(this.collection.models, function(ticket) {
        var view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      return this;
    },

    renderTicket: function(model, page) {
      var view = this.createView(
        TicketView,
        {model: model, page: page, collection: this.collection}
      );

      this.page = page;
      this.collection.bind('remove', this.removeTicket);

      return view.render().el;
    },

    removeTicket: function(model) {
      $("#id_"+model.id, this.el).fadeOut(300, function(){
        $(this).remove();
      });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return TicketListView;
 });