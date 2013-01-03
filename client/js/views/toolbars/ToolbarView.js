define([
  'jquery', 'underscore', 'backbone', 'BaseView',
  'views/toolbars/elements/FilterView',
  'views/toolbars/elements/ViewToggle',
  'text!templates/toolbars/Toolbar.html',
  'text!templates/toolbars/elements/ListCreationForm.html',
  'mustache' ],
function($, _, Backbone, BaseView, FilterView,
  ViewToggle, BarTmpl, ListFormTmpl, mustache) {

  var ToolbarView;

  ToolbarView = BaseView.extend({
    id: 'toolbar',
    tagName: 'div',
    className: 'admin-bar',
    events: {
      'click .toggle': 'toggleVisible',
      'click .createTicket': 'createTicket',
      'click .createTask': 'createList'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(BarTmpl));

      var filters = this.createView(FilterView, {
        projects: ticketer.collections.projects,
        lists: ticketer.collections.lists,
        role: ticketer.currentUser.role
      });
      var viewToggle = this.createView(ViewToggle);

      this.$el.children('.options').append(viewToggle.render(this.options.PrimaryView).el);
      this.$el.children('.options').append(filters.render().el);
      return this;
    },

    createTicket: function(e) {
      e.preventDefault();

      ticketer.routers.ticketer.navigate("tickets/new", true);
    },

    createList: function(e) {
      e.preventDefault();

      ticketer.routers.ticketer.navigate("lists/new", true);
    }

  });


  return ToolbarView;
});