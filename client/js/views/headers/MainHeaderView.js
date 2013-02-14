/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/widgets/TagFormView',
  'views/tickets/TicketFormView',
  'text!templates/headers/MainHeader.html',
  'text!templates/headers/UserOptions.html',
  'dropdowns'],
function($, _, mustache, BaseView, TagWidget, TicketFormView, tmpl_Header, tmpl_Options) {

  /**
   * A basic header view
   *
   * @param {String} route
   * @param {String} title
   */

  var MainHeader = BaseView.extend({
    className: 'header',
    events: {
      "click a[data-action]": "preventDefault",
      "click a[data-route]": "navigateTo",
      "click a[data-action='new-ticket']": "createTicket",
      "click a[data-action='refresh']": "refresh",
      "click a[data-action='new-tag']": 'showTagWidget'
    },

    initialize: function() {
      var self = this;
      _.bindAll(this);

      ticketer.EventEmitter.on('session:set', function() {
        self.addUserOptions();
      });
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Header));

      return this;
    },

    addUserOptions: function() {
      var data = {};

      $('.user-actions', this.el).remove();

      data.user = ticketer.currentUser;
      this.$el.append(Mustache.to_html(tmpl_Options, data));
    },

    preventDefault: function(e) {
      e.preventDefault();
    },

    navigateTo: function(e) {
      e.preventDefault();

      var target = $(e.currentTarget).data('route');
      ticketer.routers.ticketer.navigate(target, true);
    },

    refresh: function() {
      ticketer.collections.openTickets.reset();
      ticketer.collections.closedTickets.reset();
      ticketer.collections.users.reset();

      // Emit a `tickets:fetch` event to load ticket data
      ticketer.sockets.sock.emit('tickets:fetch');
      ticketer.collections.closedTickets.fetch({ data: { page: 1, status: 'closed' } });
      ticketer.collections.users.fetch();
    },

    showTagWidget: function(e) {
      var element = $(e.currentTarget).parent(),
          widget;

      e.preventDefault();
      e.stopPropagation();

      // Prevent multiple widgets
      if(!element.children('.tags-form').length) {
        widget = this.createView(TagWidget);
        $(element).append(widget.render().el);
      }
    },

    createTicket: function() {
      var collection = ticketer.collections.openTickets,
          view;

      if($('[role=popup]').length) return false;

      view = new TicketFormView({
        collection: collection
      });

      view.render();
    }
  });

  return MainHeader;
});