/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'views/widgets/TagWidgetView',
  'text!templates/tickets/AssignedTag.html'],
function($, _, Backbone, BaseView, mustache, TagWidget, tmpl_Tag) {

  /**
   * Show a button to trigger the TagWidget,
   * used to assign tags to a ticket.
   *
   * @param {Backbone.Model} model ticket model
   */

  var TagListView = BaseView.extend({
    tagName: 'ul',
    className: 'assigned-tags',

    events: {
      "click li.tag": 'unassignTag'
    },

    initialize: function() {
      // Remove tag on model `tag:remove`
      this.bindTo(this.model, 'tag:add tag:remove', this.render, this);
    },

    render: function() {
      var i, len, tags,
          self = this;

      this.$el.empty();

      if(this.widget) {
        this.widget.dispose();
      }

      tags = ticketer.collections.lists.filter(function(tag) {
        return tag.hasTicket(self.model.id);
      });

      this.renderWidget();

      if(tags.length === 0) {
        this.$el.append("<li class='empty'>Add a Tag</li>");
      }

      for(i = 0, len = tags.length; i < len; i++) {
        this.$el.append(this.renderTag(tags[i]));
      }

      return this;
    },

    renderTag: function(tag) {
      var data = tag.toJSON();
      data.color = ticketer.colors[data.color].name;

      return Mustache.to_html(tmpl_Tag, data);
    },

    renderWidget: function() {
      this.widget = this.createView(TagWidget, {
        collection: ticketer.collections.lists,
        model: this.model
      });

      this.$el.append(this.widget.render().el);
    },

    unassignTag: function(e) {
      var tag,
          id = $(e.currentTarget).data('id'),
          resp = confirm('Remove this tag from the Ticket?');

      if(resp) {
        tag = ticketer.collections.lists.get(id);
        if(tag) {
          tag.removeTicket(this.model.id);
          this.model.trigger('tag:remove', tag);
        }
      }
    }
  });

  return TagListView;
});