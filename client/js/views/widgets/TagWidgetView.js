/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/widgets/TagWidget.html',
  'text!templates/widgets/Tag.html'],
function($, _, Backbone, BaseView, mustache, tmpl_TagWidget, tmpl_Tag) {

  /**
   * Widget to help with tag/list assignment
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection lists collection
   */

  var TagWidgetView = BaseView.extend({
    tagName: 'li',
    className: 'widget tag-widget',

    events: {
      "click [data-action='display']": "renderTags",
      "click li": "assignTag"
    },

    initialize: function() {
      var self = this;

      this.$el.attr('data-role', 'assign-tag');
      this.$el.on('click', function(e) {
        e.stopPropagation();
      });

      $('html').on('click.tag-widget.data-api', function() {
        self.hideTags();
      });
    },

    dispose: function() {
      $('html').off('click.tag-widget.data-api');
      return BaseView.prototype.dispose.call(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_TagWidget));

      return this;
    },

    renderTags: function(e) {
      var self = this,
          ticketID = this.model.id,
          element = this.$el.find('.tags');

      element.empty();

      this.collection.each(function(tag) {
        // Filter out tags already assigned
        if(!tag.hasTicket(ticketID)) {
          element.append(self.renderTag(tag)).fadeIn(200);
        }
      });

      e.preventDefault();
      return this;
    },

    renderTag: function(tag) {
      var data = tag.toJSON();
      data.color = ticketer.colors[data.color].name;

      return Mustache.to_html(tmpl_Tag, data);
    },

    assignTag: function(e) {
      var id = $(e.currentTarget).data('id'),
          tag = this.collection.get(id);

      if(tag) {
        tag.addTicket(this.model.id);
        this.model.trigger('tag:add', tag);
      }

      this.hideTags();
    },

    hideTags: function() {
      this.$el.find('.tags').fadeOut(200, function() {
        $(this).empty();
      });
    }

  });

  return TagWidgetView;
});