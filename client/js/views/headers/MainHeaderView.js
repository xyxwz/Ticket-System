/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/widgets/TagFormView',
  'views/tickets/TicketFormView',
  'views/widgets/SearchWidgetView',
  'text!templates/headers/MainHeader.html',
  'text!templates/headers/UserOptions.html',
  'dropdowns'],
function($, _, mustache, BaseView, TagWidget,
  TicketFormView, SearchWidget, tmpl_Header, tmpl_Options) {

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
      "click a[data-action='new-ticket']": "createTicket",
      "click a[data-action='refresh']": "refresh",
      "click a[data-action='new-tag']": "showTagWidget"
    },

    initialize: function(options) {
      this.router = options.router;
      this.bindTo(ticketer.EventEmitter, 'popup:TicketForm', this.createTicket, this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Header));
      this.addUserOptions();
      this.addSearchWidget();

      return this;
    },

    addUserOptions: function() {
      var data = {};

      $('.user-actions', this.el).remove();

      data.user = ticketer.currentUser;
      this.$el.append(Mustache.to_html(tmpl_Options, data));
    },

    addSearchWidget: function() {
      var view = this.createView(SearchWidget, {
        router: this.router
      });

      this.$el.find('[data-role="search-placeholder"]').html(view.render().el);
    },

    preventDefault: function(e) {
      e.preventDefault();
    },

    refresh: function() {
      ticketer.EventEmitter.trigger('collection:reset');
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
      var view;

      if($('[role=popup]').length) return false;

      view = new TicketFormView();

      view.render();
    }
  });

  return MainHeader;
});