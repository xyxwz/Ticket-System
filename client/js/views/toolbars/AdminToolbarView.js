define([
  'jquery', 'underscore', 'backbone',
  'views/toolbars/ToolbarView',
  'views/toolbars/elements/FilterView',
  'views/toolbars/elements/AssignView',
  'views/toolbars/elements/ViewToggle',
  'text!templates/toolbars/Toolbar.html',
  'text!templates/toolbars/elements/ProjectCreationForm.html',
  'mustache' ],
function($, _, Backbone, ToolbarView, FilterView,
  AssignView, ViewToggle, BarTmpl, ProjectFormTmpl, mustache) {

  var AdminToolbarView;

  AdminToolbarView = ToolbarView.extend({
    events: {
      'click .toggle': 'toggleVisible',
      'click .createTicket': 'createTicket',
      'click .createProject': 'openCreationDialog',
      'click .createTask': 'openListForm'
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(BarTmpl));

      //Append the create project button
      this.$el.children('.options').append('<li class="green shadow create createProject">Create Project</li>');

      var filters = this.createView(FilterView, {
        projects: ticketer.collections.projects,
        lists: ticketer.collections.lists,
        role: ticketer.currentUser.role
      });
      var assign = this.createView(AssignView, { collection: ticketer.collections.admins });
      var viewToggle = this.createView(ViewToggle);

      this.$el.children('.options').append(filters.render().el);
      this.$el.children('.options').append(assign.render().el);
      this.$el.children('.options').append(viewToggle.render().el);

      return this;
    },

    openCreationDialog: function(e) {
      e.preventDefault();

      //Render help frame if it's not displayed
      if(!this.$el.children('.dialog').length) {
        this.$el.append(Mustache.to_html(ProjectFormTmpl));
        this.$el.children('.dialog').animate({ 'top': '14%' });

        this.bindTo(this.$el.find('.dialog .close'), 'click', this.removeCreationDialog);
        this.bindTo(this.$el, 'clickoutside', this.removeCreationDialog);
        this.bindTo(this.$el.find('.dialog form'), 'submit', this.createProject);
      }
    },

    removeCreationDialog: function(e) {
      e.preventDefault();

      this.$el.children('.dialog').fadeOut(300, function() {
        $(this).remove();
      });
    },

    createProject: function(e) {
      e.preventDefault();

      var element = $(e.target);

      ticketer.collections.projects.create({
        name: element.children('[name="name"]').val(),
        description: element.children('[name="description"]').val(),
        user: ticketer.currentUser.id
      }, { wait: true });

      this.removeCreationDialog(e);
    }

  });


  return AdminToolbarView;
});