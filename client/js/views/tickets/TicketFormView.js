/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'models/Ticket',
  'views/dialogs/MarkdownGuide',
  'text!templates/tickets/TicketForm.html',
  'autoresize'],
function($, _, Backbone, BaseView, mustache, TicketModel, MarkdownGuide, TicketForm) {

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
      "click [data-role='display-guide']": "displayHelp"
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
      new MarkdownGuide();
    }

  });

  return TicketFormView;

});