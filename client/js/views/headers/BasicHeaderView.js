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
      this.$el.html(Mustache.to_html(HeaderTmpl, {
        title: this.options.title,
        route: this.options.route
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