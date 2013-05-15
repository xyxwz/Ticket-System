/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/widgets/TagListWidget.html',
  'text!templates/widgets/Tag.html',
  'text!templates/widgets/TagEdit.html'],
function($, _, Backbone, BaseView, tmpl_TagList, tmpl_Tag, tmpl_TagEdit) {

  /**
   * TaskListView
   * Renders a collection of Tags
   *
   * @param {Backbone.Collection} collection
   */

  var TaskListView = BaseView.extend({
    className: 'option-set tag-list-widget',

    events: {
      "click .tag[data-id]": "filterListView",
      "dblclick [data-action='edit']": "editTag",
      "mousedown [data-action='delete']": "deleteTag",
      "blur .editable input": "saveTag"
    },

    initialize: function() {
      this.bindTo(this.collection, 'add remove reset', this.renderTags, this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_TagList));
      this.renderTags();

      return this;
    },

    /**
     * Generate an array of all tag markup and
     * render to the element
     */

    renderTags: function() {
      var self = this,
          html = [];

      if(this.collection.length) {
        this.collection.each(function(tag) {
          html.push(self.renderTag(tag));
        });
      }
      else {
        html.push('<li class="empty">You have no tags</li>');
      }

      this.$el.find('.group').html(html.join(''));
    },

    /**
     * Render a single tag model
     *
     * @param {Backbone.model} tag
     */

    renderTag: function(tag) {
      var data = tag.toJSON();
      data.color = ticketer.colors[data.color].name;

      return Mustache.to_html(tmpl_Tag, data);
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
          tag = this.collection.get(target.data('id')),
          tickets = tag.get('tickets');

      // Toggle functionality
      if(target.hasClass('active')) {
        target.removeClass('active');
        ticketer.EventEmitter.trigger('list:filter');
      }
      else {
        target.siblings().removeClass('active');
        target.addClass('active');

        // Trigger a filter event passing the filter function
        ticketer.EventEmitter.trigger('list:filter', function(ticket) {
          return ~tickets.indexOf(ticket.id);
        });
      }
    },

    /**
     * Make all tags in the current view editable
     *
     * @param {jQuery.Event} e
     */

    editTag: function(e) {
      var element = $(e.currentTarget).parent(),
          data = this.collection.get(element.data('id')).toJSON();

      data.color = ticketer.colors[data.color].name;
      element.replaceWith(Mustache.to_html(tmpl_TagEdit, data));
      this.$el.find('input').focus();
    },

    /**
     * Save the tag that is currently being edited
     * and unbind previously bound events
     *
     * TODO: This fires when delete is clicked, event with propagation
     *       stopped. Get a workaround so this doesn't get fired
     *       after deletion.
     *
     * @param {jQuery.Event} e
     */

    saveTag: function(e) {
      var data,
          self = this,
          element = this.$el.find('.editable'),
          name = element.find('input').val(),
          tag = this.collection.get(element.data('id'));

      if(tag) {
        tag.save({name: name});
        element.replaceWith(self.renderTag(tag));
      }
    },

    /**
     * Delete the tag and remove the element from the view
     *
     * @param {jQuery.Event} e
     */

    deleteTag: function(e) {
      var element = $(e.currentTarget).parent(),
          tag = this.collection.get(element.data('id'));

      if(tag) {
        tag.destroy();
      }
      else {
        console.error("Attempted to get tag: #" + id + ", but failed.");
      }

      // Try to prevent the edit blur
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  });

  return TaskListView;
});