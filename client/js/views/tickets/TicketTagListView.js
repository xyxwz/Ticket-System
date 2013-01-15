/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'views/widgets/TagWidgetView',
  'text!templates/tickets/TagButton.html'],
function($, _, Backbone, BaseView, mustache, TagWidget, tmpl_TagButton) {

  /**
   * Show a button to trigger the TagWidget,
   * used to assign tags to a ticket.
   *
   * @param {Backbone.Model} model ticket model
   */

  var TagListView = BaseView.extend({
    className: 'tag-assign',

    events: {
      "click a[data-action='assign-tag']": 'showTagWidget'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_TagButton));

      return this;
    },

    showTagWidget: function(e) {
      var element = $(e.currentTarget).parent(),
          widget;

      e.preventDefault();
      e.stopPropagation();

      // Prevent multiple widgets
      if(!element.children('.widget').length) {
        widget = this.createView(TagWidget, {
          model: this.model
        });

        $(element).append(widget.render().el);
      }
    }
  });

  return TagListView;
});