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
    attributes: {'role': 'popup'},

    events: {
      "click [data-action='create']": "createTicket",
      "click [data-action='cancel']": "clearPopup",
      "click [data-role='display-guide']": "displayHelp"
    },

    initialize: function() {
      $('body').on('keyup', $.proxy(this.escape, this));
    },

    render: function() {
      $(this.el).html(Mustache.to_html(TicketForm));
      $('body').append(this.el);

      return this;
    },

    // Handle Escape key to close dialog
    escape: function(e) {
      var self = this;
      e.preventDefault();

      if(e.which == 27)
        self.clearPopup(e);
    },

    clearPopup: function() {
      $('body').off('keyup', this.escape);
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

      ticket.save({}, {
        wait: true,
        success: function() {
          self.clearPopup();
        }
      });

      e.preventDefault();
    },

    displayHelp: function(e) {
      e.preventDefault();
      e.stopPropagation();
      new MarkdownGuide();
    }

  });

  return TicketFormView;

});