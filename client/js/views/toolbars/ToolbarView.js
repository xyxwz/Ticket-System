define([
  'jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/toolbars/Toolbar.html' ],
  function($, _, Backbone, BaseView, mustache, ToolbarTmpl) {

  var ToolbarView = BaseView.extend({
    className: 'sidebar',
    events: {
      'click .group li[data-route]': 'navigateTo'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(ToolbarTmpl));
      return this;
    },

    /**
     * Navigate to the clicked element's
     * data-route attribute
     */

    navigateTo: function(e) {
      e.preventDefault();

      var target = $(e.target).data('route');

      this.selectTab(target);
      ticketer.routers.ticketer.navigate(target, true);
    },

    selectTab: function(tab) {
      this.$el.find('.group > .active').removeClass('active');

      if(tab) {
        this.$el.find('li[data-route="' + tab + '"]').addClass('active');
      }

      return this;
    }

  });

  return ToolbarView;
});