/**
 * A single admin bar element
 */
define([
  'jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/toolbars/elements/ViewToggleElement.html',
  'mustache', 'jqueryui/draggable' ],
function($, _, Backbone, BaseView, ElementTmpl, AdminTmpl, mustache) {
  var PrimaryViewToggle;

  PrimaryViewToggle = BaseView.extend({
    tagName: 'li',
    className: 'toolbar-element',
    events: {
      'click .title': 'toggleVisible',
      'click .open': 'showOpenTickets',
      'click .activity': 'showActivity',
      'click .closed': 'showClosedTickets'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function(view) {
      var self = this;

      this.$el.html(Mustache.to_html(ElementTmpl));
      this.$el.children('.group').hide();

      if(view) {
        this.$el.find('.' + view).addClass('active');
      }

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

    showActivity: function(e) {
      e.preventDefault();

      this.colorTab(e);
      ticketer.routers.ticketer.navigate("tickets/activity", true);
    },

    showOpenTickets: function(e) {
      e.preventDefault();

      this.colorTab(e);
      ticketer.routers.ticketer.navigate("tickets/open", true);
    },

    showClosedTickets: function(e) {
      e.preventDefault();

      this.colorTab(e);
      ticketer.routers.ticketer.navigate("tickets/closed", true);
    },

    colorTab: function(e) {
      $(e.target).siblings('li').removeClass('active');
      $(e.target).addClass('active');

      // Remove active class on other toolbar-elements lists that have an active item
      this.$el.siblings('.toolbar-element').find('li.active').removeClass('active');
    }
  });


  return PrimaryViewToggle;
});