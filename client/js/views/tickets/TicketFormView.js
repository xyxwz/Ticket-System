/* New Ticket Form */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/tickets/TicketForm.html', 'autoresize'],
function($, _, Backbone, BaseView, mustache, TicketForm) {

  var TicketFormView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click button":  "createTicket"
    },

    initialize: function() {

      // Bindings using the garbage collectors bindTo()
      _.bindAll(this);
      this.bindTo(this.collection, 'add', this.redirect);
    },

    render: function() {
      var data;

      data = currentUser;
      data.shortname = data.name.split(' ')[0];

      $(this.el).html(Mustache.to_html(TicketForm, currentUser));

      this.bindTo(this, 'viewRendered', this.bindResize);

      return this;
    },

    createTicket: function(e) {
      e.preventDefault();

      var self = this;
      var title = $('[name=title]', this.el).val();
      var description = $('[name=description]', this.el).val();
      
      this.collection.create({
        title: title,
        description: description
      },
      { wait: true });
    },

    bindResize: function() {
      $('textarea', this.el).autoResize({
        minHeight: 150,
        extraSpace: 14
      });
    },

    redirect: function(model) {
      window.history.replaceState({}, document.title, "#tickets/open");
      ticketer.routers.ticketer.navigate("tickets/"+model.id, true);
    }

  });

  return TicketFormView;

});