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
      "click a[data-action='clear']": "resetFilter",
      "blur input[data-action='filter']": "hideClear",
      "focus input[data-action='filter']": "showClear",
      "keyup input[data-action='filter']": "emitFilter"
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
     * Trigger the `list:filter` event on collections, passing the
     *  custom search filter.
     *
     * @param {jQuery.Event} e
     */

    emitFilter: function(e) {
      var val = $(e.currentTarget).val().toLowerCase();

      ticketer.EventEmitter.trigger('list:filter', function(ticket) {
        return ~ticket.get('title').toLowerCase().indexOf(val);
      });
    },

    /**
     * Trigger the `list:filter` event on collections with no
     *  arguments to reset the current filter.
     *
     * @param {jQuery.Event} e
     */

    resetFilter: function(e) {
      e.preventDefault();
      this.$el.children('input').val('');
      ticketer.EventEmitter.trigger('list:filter');
    }

  });

  return SearchWidget;
});