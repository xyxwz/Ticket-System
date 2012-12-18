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
      'click h1': 'toggleVisible',
      'click .open': 'showOpenTickets',
      'click .activity': 'showActivity',
      'click .closed': 'showClosedTickets'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function(view) {
      var self = this;

      this.$el.html(Mustache.to_html(ElementTmpl, {
        title: 'View'
      }));

      if(view) {
        this.$el.find('.' + view).addClass('yellow');
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
      $(e.target).siblings('li').removeClass('yellow');
      $(e.target).addClass('yellow');
    }
  });


  return PrimaryViewToggle;
});