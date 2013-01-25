/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'text!templates/tickets/TicketForm.html',
  'text!templates/tickets/MarkdownGuide.html',
  'autoresize'],
function($, _, Backbone, BaseView, mustache, TicketForm, GuideTmpl) {

  /**
   * New Ticket Form
   *
   * @param {Backbone.Collection} collection
   */

  var TicketFormView = BaseView.extend({
    className: 'ticket-form scrollable',
    events: {
      "click [data-action='create']": "createTicket",
      "click [data-action='cancel']": "redirect",
      "click [data-role='display-guide']": "displayHelp",
      "click .dialog .close": "removeHelp",
      "focus textarea": "initResize"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo($(window), 'resize', this.setHeight);
      this.bindTo(this.collection, 'sync', this.redirect);
    },

    render: function() {
      var data;

      data = ticketer.currentUser;
      data.shortname = data.name.split(' ')[0];

      $(this.el).html(Mustache.to_html(TicketForm, ticketer.currentUser));
      this.setHeight();

      return this;
    },

    initResize: function() {
      this.$el.find('textarea').autoResize({
        minHeight: 168,
        extraSpace: 14
      });
    },

    createTicket: function(e) {
      var self = this;
      var title = $('[name=title]', this.el).val();
      var description = $('[name=description]', this.el).val();

      this.collection.create({
        title: title,
        description: description,
        socket: ticketer.sockets.id
      }, {
        wait: true
      });

      e.preventDefault();
    },

    /**
     * Override the dispose function to remove leftover
     * autoresize data and bindings.
     */

    dispose: function() {
      var plugin = this.$el.find('textarea').data('AutoResizer');

      if(plugin) {
        plugin.destroy();
      }

      return BaseView.prototype.dispose.call(this);
    },

    redirect: function() {
      ticketer.routers.ticketer.navigate("tickets/mine", true);
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
    },

    /**
     * Set the form height to fix resizing over the window height.
     */

    setHeight: function() {
      var header = $('header').height(),
          total = $(window).height(),
          height = total - header;

      this.$el.css({height: height});
    }

  });

  return TicketFormView;

});