/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/widgets/TagListWidget.html',
  'text!templates/widgets/Tag.html'],
function($, _, Backbone, BaseView, tmpl_TagList, tmpl_Tag) {

  /**
   * TaskListView
   * Renders a collection of Tags
   *
   * @param {Backbone.Collection} collection
   */

  var TaskListView = BaseView.extend({
    className: 'option-set tag-list-widget',

    events: {
      "click .tags li": "filterListView"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection, 'add', this.renderTags);
      this.bindTo(this.collection, 'reset', this.renderTags);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_TagList));
      this.renderTags();

      return this;
    },

    /**
     * Render all tags
     */

    renderTags: function() {
      this.$el.find('.group').empty();
      this.collection.each(this.renderTag);
    },

    /**
     * Render a single tag model
     *
     * @param {Backbone.model} tag
     */

    renderTag: function(tag) {
      var data = tag.toJSON();
      data.color = ticketer.colors[data.color].name;

      this.$el.find('.group').append(Mustache.to_html(tmpl_Tag, data));
    },

    /**
     * Get the clicked tag id, retrieve it's tickets,
     * and fire a filter event with the corresponding
     * filter function.
     *
     * @param {jQuery.Event} e
     */

    filterListView: function(e) {
      var target = $(e.currentTarget),
          tag = ticketer.collections.lists.get(target.data('id')),
          tickets = tag.get('tickets');

      // Toggle functionality
      if(target.hasClass('active')) {
        target.removeClass('active');
        ticketer.collections.openTickets.trigger('filter');
      }
      else {
        target.siblings().removeClass('active');
        target.addClass('active');

        // Trigger a filter event passing the filter function
        ticketer.collections.openTickets.trigger('filter', function(ticket) {
          return ~tickets.indexOf(ticket.id);
        });
      }
    }


  });

  return TaskListView;
});