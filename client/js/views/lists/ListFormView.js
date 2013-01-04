      var element = $(e.target);

      ticketer.collections.lists.create({
        name: element.children('[name="name"]').val(),
        user: ticketer.currentUser.id
      },{wait: true});

      this.removeListForm(e);

/**
 * List form view
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache', 'text!templates/lists/ListForm.html'],
function($, _, Backbone, BaseView, mustache, ListForm) {

  var ListFormView = BaseView.extend({
    tagName: 'div',
    className: 'row',

    events: {
      "click [data-action='create']": "create",
      "click [data-action='cancel']": "back"
    },

    initialize: function() {
      _.bindAll(this);
      this.bindTo(this.collection, 'sync', this.redirect);
    },

    render: function() {
      var data;

      data = ticketer.currentUser;
      data.shortname = data.name.split(' ')[0];

      $(this.el).html(Mustache.to_html(TicketForm, ticketer.currentUser));

      this.bindTo(this, 'viewRendered', this.bindResize);

      return this;
    },

    create: function(e) {
      e.preventDefault();

      var self = this;
      var title = $('[name=title]', this.el).val();

      this.collection.create({
        title: title
      },
      { wait: true });
    },

    redirect: function(model) {
      this.dispose();
      window.history.replaceState({}, document.title, "#tickets/open");
      ticketer.routers.ticketer.navigate("tickets/" + model.id, true);
    },

    back: function(e) {
      e.preventDefault();
      this.dispose();
      window.history.back();
    }

  });

  return ListFormView;

});