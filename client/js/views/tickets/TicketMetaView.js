/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/widgets/UserWidgetView',
  'text!templates/tickets/TicketMeta.html',
  'text!templates/tickets/AssignedUser.html'],
function($, _, mustache, BaseView, UserWidget, tmpl_TicketMeta, tmpl_User) {

  /**
   * TicketMetaView
   * render a tickets meta data
   *
   * @param {Backbone.Model} model
   * @param {Boolean} renderAll
   */

  var TicketMetaView = BaseView.extend({
    tagName: 'ul',
    className: 'ticket-meta',

    events: {
      "click li.assigned": "unAssignUser",
      "click a[data-widget=user-widget]": "showAssignWidget"
    },

    initialize: function() {
      _.bindAll(this);

      // Bindings
      this.bindTo(this.model, 'change', this.render);
    },

    /**
     * Fills the ticket-meta container class with meta-data.
     *
     *
     * Appends all users if renderAll === true,
     * otherwise just renders users up until cap === 0
     */

    render: function() {
      var self = this,
          assigned = this.model.get('assigned_to'),
          users;

      if(this.widget) {
        this.widget.dispose();
      }

      users = ticketer.collections.users.filter(function(user) {
        return ~assigned.indexOf(user.id);
      });

      users.forEach(function(user) {
        self.$el.append(Mustache.to_html(tmpl_User, user.toJSON()));
      });

      self.$el.append(Mustache.to_html(tmpl_TicketMeta));

      return this;
    },

    showAssignWidget: function(e) {
      var element;

      e.preventDefault();

      this.widget = this.createView(UserWidget, {
        collection: ticketer.collections.users,
        model: this.model
      });

      element = $('li.assign-add', this.el);
      element.remove();

      this.$el.append(this.widget.render().el);
    },

    unAssignUser: function(e) {
      var id = $(e.currentTarget).data('id');
      var resp = confirm('Remove the user from the Ticket?');
      if(resp) this.model.unassignUser(id);
    }

  });

  return TicketMetaView;
});