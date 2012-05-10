/* New Ticket Form */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/tickets/TicketForm.html',
'text!templates/tickets/MarkdownGuide.html',
'autoresize'],
function($, _, Backbone, BaseView, mustache, TicketForm, GuideTmpl) {

  var TicketFormView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click button": "createTicket",
      "click .guide": "displayHelp"
    },

    initialize: function() {

      // Bindings using the garbage collectors bindTo()
      _.bindAll(this);
      this.bindTo(this.collection, 'sync', this.redirect);
    },

    render: function() {
      var data;

      data = ticketer.currentUser;
      data.shortname = data.name.split(' ')[0];

      $(this.el).html(Mustache.to_html(TicketForm, ticketer.currentUser));

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
        description: description,
        socket: ticketer.sockets.id
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
      this.dispose();
      window.history.replaceState({}, document.title, "#tickets/open");
      ticketer.routers.ticketer.navigate("tickets/"+model.id, true);
    },

    displayHelp: function(e) {
      e.preventDefault();

      //Render help frame
      this.$el.append(Mustache.to_html(GuideTmpl));
      $('.dialog').animate({ 'top': '12%' });

      this.bindTo($('.dialog .close', this.el), 'click', this.removeHelp);
      this.bindTo($(this.el), 'clickoutside', this.removeHelp);
    },

    removeHelp: function(e) {
      e.preventDefault();

      $('.dialog', this.el).remove();
    }

  });

  return TicketFormView;

});