/* New Ticket Form */

define(['jquery', 'underscore', 'backbone', 'garbage', 'mustache', 'text!templates/tickets/TicketForm.html'], 
function($, _, Backbone, BaseView, mustache, TicketForm) {

  var TicketFormView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click button":  "createTicket",
    },

    initialize: function() {

      // Bindings using the garbage collectors bindTo()
      _.bindAll(this);
      this.bindTo(this.collection, 'add', this.redirect);
    },

    render: function() {
      $(this.el).html(TicketForm);
      $(this.el).html(Mustache.to_html(TicketForm, currentUser));
      return this;
    },

    createTicket: function(e) {
      e.preventDefault();

      this.collection.create({
        title: $('[name=title]', this.el).val(),
        description: $('[name=description]', this.el).val(),
      });
    },

    redirect: function(model) {
      ticketer.routers.ticketer.navigate("tickets/"+model.id, true);
    },

  });

  return TicketFormView;

});