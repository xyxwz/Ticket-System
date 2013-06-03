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
      // "focus a[data-action='filter']": "bind"
      "keyup input[data-action='filter']": "emitFilter"
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Search));

      return this;
    },

    emitFilter: function(e) {
      var val = $(e.currentTarget).val().toLowerCase();

      ticketer.EventEmitter.trigger('list:filter', function(ticket) {
        return ~ticket.get('title').toLowerCase().indexOf(val);
      });
    },

    resetFilter: function(e) {
      e.preventDefault();
      this.$el.children('input').val('');
      ticketer.EventEmitter.trigger('list:filter');
    }

  });

  return SearchWidget;
});