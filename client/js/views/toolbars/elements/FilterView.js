/**
 * A single admin bar element
 */
define([
  'jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/toolbars/elements/FilterElement.html',
  'text!templates/toolbars/elements/ItemTemplate.html',
  'mustache', 'jqueryui/draggable' ],
function($, _, Backbone, BaseView, ElementTmpl, ItemTmpl, mustache) {
  var FilterView;

  FilterView = BaseView.extend({
    tagName: 'li',
    className: 'toolbar-element',
    events: {
      'click .showProjects': 'showProjects',
      'click .showLists': 'showLists',
      'click .list': 'filterTickets',
      'click .project': 'filterTickets',
      'click .delete': 'deleteItem'
    },

    initialize: function() {
      _.bindAll(this);

      this.role = this.options.role || 'member';
      this.projects = this.options.projects;
      this.lists = this.options.lists;

      this.bindTo(this.projects, 'add', this.renderProjects);
      this.bindTo(this.projects, 'reset', this.renderProjects);
      this.bindTo(this.lists, 'add', this.renderLists);
      this.bindTo(this.lists, 'reset', this.renderLists);
    },

    render: function() {
      var self = this;

      this.$el.html(Mustache.to_html(ElementTmpl));

      this.renderProjects();
      this.renderLists();
      this.showProjects();

      return this;
    },

    renderProjects: function() {
      var self = this;

      self.$el.children('.projects').empty();

      this.projects.each(function(project) {
        var data = {
          id: project.id,
          name: project.get('name'),
          description: project.get('description')
        };

        self.$el.children('.projects').append(Mustache.to_html(ItemTmpl, data));
      });

      if(this.role === 'admin') {
        this.$el.find('.projects li').draggable({
          revert: true,
          helper: 'clone',
          scope: 'ticket_property',
          zIndex: 302,
          cursorAt: {
            top: 28,
            left: 69
          }
        });
      }

      return this;
    },

    renderLists: function() {
      var self = this;

      self.$el.children('.lists').empty();

      this.lists.each(function(list) {
        var data = {
          id: list.id,
          name: list.get('name')
        };

        self.$el.children('.lists').append(Mustache.to_html(ItemTmpl, data));
      });

      this.$el.find('.lists li').draggable({
        revert: true,
        helper: 'clone',
        scope: 'ticket_property',
        zIndex: 302,
        cursorAt: {
          top: 28,
          left: 69
        }
      });

      return this;
    },

    showProjects: function(e) {
      if(e) e.preventDefault();

      var siblings = this.$el.children('.showLists');
          element = this.$el.children('.showProjects');

      this.$el.children('.lists').hide();

      if(siblings.hasClass('yellow')) siblings.removeClass('yellow');
      if(!siblings.hasClass('green')) siblings.addClass('green');

      element.addClass('yellow');
      element.removeClass('green');
      this.$el.children('.projects').show();
    },

    showLists: function(e) {
      if(e) e.preventDefault();

      var siblings = this.$el.children('.showProjects'),
          element = this.$el.children('.showLists');

      this.$el.children('.projects').hide();

      if(siblings.hasClass('yellow')) siblings.removeClass('yellow');
      if(!siblings.hasClass('green')) siblings.addClass('green');

      element.addClass('yellow');
      element.removeClass('green');
      this.$el.children('.lists').show();
    },

    filterTickets: function(e) {
      e.preventDefault();

      var id = $(e.target).data('id'),
          selected = $(e.target),
          lists = ticketer.collections.lists,
          projects = ticketer.collections.projects,
          filter = projects.get(id) || lists.get(id);

      ticketer.EventEmitter.trigger('tickets:setFilters', filter.get('tickets'));

      if(!selected.hasClass('selected')) selected.addClass('selected');
      selected.siblings().removeClass('selected');
    },

    deleteItem: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var element = $(e.target).parent(),
          projects = ticketer.collections.projects,
          lists = ticketer.collections.lists,
          item = projects.get(element.data('id')) || lists.get(element.data('id'));

      item.destroy();
      element.slideUp(200, function() {
        element.remove();
      });
    }

  });


  return FilterView;
});