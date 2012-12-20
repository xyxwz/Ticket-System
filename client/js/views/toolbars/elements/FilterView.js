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

      this.bindTo(this.projects, 'add reset remove', this.renderProjects);
      this.bindTo(this.lists, 'add reset remove', this.renderLists);
    },

    render: function() {
      this.$el.html(ElementTmpl);

      this.renderProjects().renderLists();
      this.$el.children('.group').hide();

      return this;
    },

    renderProjects: function() {
      var self = this;

      self.$el.children('.projects').empty();

      if(!this.projects.length) {
        this.$el.children('.projects').append('<li class="written">There are no projects</li>');
        return this;
      }

      this.projects.each(function(project) {
        var data = {
          id: project.id,
          name: project.get('name'),
          description: project.get('description'),
          type: 'project'
        };

        self.$el.children('.projects').append(Mustache.to_html(ItemTmpl, data));
      });

      if(this.role === 'admin') {
        this.$el.find('.projects li').draggable({
          revert: true,
          helper: 'clone',
          scope: 'ticket_property',
          zIndex: 302,
          distance: 30,
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

      if(!this.lists.length) {
        this.$el.children('.lists').append('<li>You have no tasks</li>');
        return this;
      }

      this.lists.each(function(list) {
        var data = {
          id: list.id,
          name: list.get('name'),
          type: 'list'
        };

        self.$el.children('.lists').append(Mustache.to_html(ItemTmpl, data));
      });

      this.$el.find('.lists li').draggable({
        revert: true,
        helper: 'clone',
        scope: 'ticket_property',
        zIndex: 302,
        distance: 30,
        cursorAt: {
          top: 28,
          left: 69
        }
      });

      return this;
    },

    showProjects: function(e) {
      if(e) e.preventDefault();

      var siblings = this.$el.find('.options .showLists'),
          element = this.$el.find('.options .showProjects'),
          items = this.$el.children('.projects');

      if(items.siblings('.lists').is(':visible')) {
        items.siblings('.lists').hide();
        items.show();
      }
      else {
        items.slideDown();
      }
    },

    showLists: function(e) {
      if(e) e.preventDefault();

      var siblings = this.$el.find('.options .showProjects'),
          element = this.$el.find('.options .showLists'),
          items = this.$el.children('.lists');

      if(items.siblings('.projects').is(':visible')) {
        items.siblings('.projects').hide();
        items.show();
      }
      else {
        items.slideDown();
      }
    },

    filterTickets: function(e) {
      e.preventDefault();

      var id = $(e.target).data('id'),
          selected = $(e.target),
          lists = ticketer.collections.lists,
          projects = ticketer.collections.projects,
          filter = projects.get(id) || lists.get(id);

      ticketer.EventEmitter.trigger('tickets:setFilters', filter.get('tickets'));
      this.$el.find('.group li').removeClass('active');
      selected.addClass('active');
    },

    deleteItem: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var element = $(e.target).parent(),
          projects = ticketer.collections.projects,
          lists = ticketer.collections.lists,
          item = projects.get(element.data('id')) || lists.get(element.data('id'));

      element.remove();
      item.destroy();
    },

    toggle: function() {
      this.$el.children('.group').slideUp();

      return this;
    }

  });


  return FilterView;
});