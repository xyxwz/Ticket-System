/**
 * A single admin bar element
 */
define([
  'jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/toolbars/elements/BaseElement.html',
  'text!templates/toolbars/elements/UserElement.html',
  'mustache', 'jqueryui/draggable' ],
function($, _, Backbone, BaseView, ElementTmpl, AdminTmpl, mustache) {
  var AssignView;

  AssignView = BaseView.extend({
    tagName: 'li',
    className: 'toolbar-element',
    events: {
      'click h1': 'toggleVisible'
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection, 'reset', this.render);
    },

    render: function() {
      var self = this;

      this.$el.html(Mustache.to_html(ElementTmpl, {
        title: 'Assign Ticket'
      }));

      this.collection.each(function(element) {
        var data = {
          id: element.id,
          name: element.get('name'),
          avatar: element.get('avatar'),
          shortname: element.get('name').split(' ')[0]
        };

        self.$el.children('.group').append(Mustache.to_html(AdminTmpl, data));
        self.draggatize();
      });

      return this;
    },

    toggleVisible: function(e) {
      e.preventDefault();

      var element = this.$el.children('.group');

      if(element.is(':visible')) {
        element.slideUp(400);
      }
      else {
        element.slideDown(400);
      }
    },

    draggatize: function() {
      this.$el.find('.group li').draggable({
        revert: true,
        helper: "clone",
        scope: "ticket_property",
        zIndex: 302,
        cursorAt: {
          top: 28,
          left: 69
        }
      });

      return this;
    }
  });


  return AssignView;
});