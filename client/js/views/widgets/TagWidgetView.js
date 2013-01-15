/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/widgets/Tag.html'],
function($, _, Backbone, BaseView, mustache, tmpl_Tag) {

  /**
   * Widget to help with tag/list assignment
   *
   * @param {Backbone.Model} model ticket model
   */

  var TagWidgetView = BaseView.extend({
    tagName: 'ul',
    className: 'widget',

    events: {
      "click li": "assignTag"
    },

    initialize: function() {
      _.bindAll(this);

      $(this.el).attr('data-role', 'task-list');
      this.bindTo(this.$el, 'click', function(e) { e.stopPropagation(); });
      this.bindTo($('html'), 'click.tag-widget.data-api', this.dispose);
    },

    render: function() {
      var self = this,
          ticketID = this.model.id;

      ticketer.collections.lists.each(function(tag) {
        // Filter out tags already assigned
        if(!tag.hasTicket(ticketID)) {
          self.renderTag(tag);
        }
      });

      return this;
    },

    renderTag: function(tag) {
      var data = tag.toJSON();

      data.color = ticketer.colors[data.color].name;
      this.$el.append(Mustache.to_html(tmpl_Tag, data));
    },

    assignTag: function(e) {
      var id = $(e.currentTarget).data('id'),
          list = ticketer.collections.lists.get(id);

      e.preventDefault();

      if(list) {
        list.addTicket(this.model.id);
      }

      this.dispose();
    }

  });

  return TagWidgetView;
});