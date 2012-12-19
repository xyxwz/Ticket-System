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
      'click .createTask': 'openListForm'
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

      this.$el.children('.options').append(filters.render().el);
      this.$el.children('.options').append(viewToggle.render(this.options.PrimaryView).el);

      return this;
    },

    createTicket: function(e) {
      e.preventDefault();

      ticketer.routers.ticketer.navigate("tickets/new", true);
    },

    toggleVisible: function(e) {
      e.preventDefault();

      var self = this;

      if(this.$el.css('width') !== '0px') {
        this.$el.animate({ width: '0px' }, 400, function() {
          self.$el.children('.options').hide();
        });
      }
      else {
        this.$el.animate({ width: '196px' }, 400);
        this.$el.children('.options').show();
      }
    },

    openListForm: function(e) {
      e.preventDefault();

      //Render frame if it's not displayed
      if(!this.$el.children('.dialog').length) {
        this.$el.append(Mustache.to_html(ListFormTmpl));
        this.$el.children('.dialog').animate({ 'top': '14%' });

        this.bindTo(this.$el.find('.dialog .close'), 'click', this.removeListForm);
        this.bindTo(this.$el, 'clickoutside', this.removeListForm);
        this.bindTo(this.$el.find('.dialog form'), 'submit', this.createList);
      }
    },

    removeListForm: function(e) {
      e.preventDefault();

      this.$el.children('.dialog').fadeOut(300, function() {
        $(this).remove();
      });
    },

    createList: function(e) {
      var element = $(e.target);

      ticketer.collections.lists.create({
        name: element.children('[name="name"]').val(),
        user: ticketer.currentUser.id
      },{wait: true});

      this.removeListForm(e);
    },

    reset: function() {
      var elements = this.$el.find('.selected');

      elements.removeClass('selected');
    }

  });


  return ToolbarView;
});