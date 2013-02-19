/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'models/Ticket',
  'text!templates/tickets/TicketForm.html',
  'text!templates/tickets/MarkdownGuide.html',
  'autoresize'],
function($, _, Backbone, BaseView, mustache, TicketModel, TicketForm, GuideTmpl) {

  /**
   * New Ticket Form
   *
   * @param {Backbone.Collection} collection
   */

  var TicketFormView = BaseView.extend({
    className: 'ticket-form',
    events: {
      "click [data-action='create']": "createTicket",
      "click [data-action='cancel']": "clearPopup",
      "click [data-role='display-guide']": "displayHelp",
      "click .dialog .close": "removeHelp"
    },

    initialize: function() {
      this.$el.attr('role', 'popup');
      this.bindTo(this.collection, 'add', this.clearPopup, this);
    },

    render: function() {
      var data;

      data = ticketer.currentUser;
      data.shortname = data.name.split(' ')[0];

      $(this.el).html(Mustache.to_html(TicketForm, ticketer.currentUser));
      $('body').append(this.el);

      return this;
    },

    clearPopup: function() {
      this.dispose();
    },

    createTicket: function(e) {
      var self = this,
          title = $('[name=title]', this.el).val(),
          description = $('[role=description]', this.el).val(),
          ticket;

      ticket = new TicketModel({
        title: title,
	description: description
      });

      ticket.save({}, {wait: true});

      this.bindTo(ticket, 'sync', function(model) {
        self.collection.add(model);
      });

      e.preventDefault();
    },

    displayHelp: function(e) {
      e.preventDefault();
      if(this.$el.find('.dialog').length) return;

      //Render help frame
      this.$el.append(Mustache.to_html(GuideTmpl));
      $('.dialog').animate({ 'top': '18%' });
    },

    removeHelp: function(e) {
      e.preventDefault();

      this.$el.find('.dialog').fadeOut(200, function() {
        $(this).remove();
      });
    }

  });

  return TicketFormView;

});