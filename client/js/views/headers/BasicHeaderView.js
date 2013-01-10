/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/headers/BasicHeader.html'],
function($, _, mustache, BaseView, HeaderTmpl) {

  /**
   * A basic header view
   *
   * @param {String} route
   * @param {String} title
   */

  var BasicHeader = BaseView.extend({
    className: 'view-header',
    events: {
      "click button[data-route]": "navigateTo"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var text;

      switch(this.options.route) {
        case 'lists/new':
          text = 'Create Task';
          break;
        case 'tickets/new':
          text = 'Create Ticket';
          break;
      }

      this.$el.html(Mustache.to_html(HeaderTmpl, {
        title: this.options.title,
        route: this.options.route,
        button: text
      }));

      return this;
    },

    navigateTo: function(e) {
      e.preventDefault();

      var target = $(e.currentTarget).data('route');
      ticketer.routers.ticketer.navigate(target, true);
    }
  });

  return BasicHeader;
});