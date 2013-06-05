/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/widgets/Search.html'],
function($, _, Backbone, BaseView, tmpl_Search) {

  /**
   * SearchWidget
   * Renders a collection of Tags
   *
   * @param {Backbone.Collection} collection
   */

  var SearchWidget = BaseView.extend({
    className: 'search-widget',
    attributes: {
      'data-role': 'search'
    },

    events: {
      "click a[data-action='clear']": "showOpen",
      "blur input[data-action='filter']": "hideClear",
      "focus input[data-action='filter']": "showClear",
      "keyup input[data-action='filter']": "attemptSearch"
    },

    initialize: function(options) {
      var self = this;

      this.router = options.router;

      this.router.on('route', function(route, params) {
        if(route === 'searchTickets') {
          self.$el.children('input').val(params[0]);
        } else {
          self.$el.children('input').val('');
        }
      });
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Search));

      return this;
    },

    /**
     * Show the clear button on focus of input
     *
     * @param {jQuery.Event} e
     */

    showClear: function(e) {
      this.$el.children('.clear').fadeIn();
    },

    /**
     * Hide the clear button on blur of input
     *
     * @param {jQuery.Event} e
     */

    hideClear: function(e) {
      this.$el.children('.clear').fadeOut();
    },

    /**
     * Search tickets on enter press
     *
     * @param {jQuery.Event} e
     */

    attemptSearch: function(e) {
      if(e.keyCode !== 13) return;

      var val = $(e.currentTarget).val().toLowerCase();
      this.router.navigate('tickets/search/' + encodeURIComponent(val), true);
    },

    /**
     * Return to open tickets
     *
     * @param {jQuery.Event} e
     */

    showOpen: function(e) {
      e.preventDefault();
      this.router.navigate('tickets/open', true);
    }

  });

  return SearchWidget;
});