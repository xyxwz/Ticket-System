/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/widgets/UserWidgetView',
  'text!templates/tickets/AssignedUser.html'],
function($, _, mustache, BaseView, UserWidget, tmpl_User) {

  /**
   * TicketMetaView
   * render a tickets meta data
   *
   * @param {Backbone.Model} model
   * @param {Boolean} renderAll
   */

  var TicketAssignView = BaseView.extend({
    tagName: 'ul',
    className: 'assigned-users',

    events: {
      "click li.user": "unAssignUser"
    },

    initialize: function() {
      // Bindings
      this.bindTo(this.model, 'change:assigned_to', this.render, this);
    },

    /**
     * Adds the User Widget to TicketMetaView
     */

    render: function() {
      var users,
          self = this,
          assigned = this.model.get('assigned_to');

      this.$el.empty();

      if(this.widget) {
        this.widget.dispose();
      }

      users = ticketer.collections.users.filter(function(user) {
        return ~assigned.indexOf(user.id);
      });

      users.forEach(function(user) {
        self.$el.append(Mustache.to_html(tmpl_User, user.toJSON()));
      });

      this.renderWidget();
      return this;
    },

    renderWidget: function() {
      this.widget = this.createView(UserWidget, {
        collection: ticketer.collections.users,
        model: this.model
      });

      this.$el.append(this.widget.render().el);
    },

    unAssignUser: function(e) {
      var id = $(e.currentTarget).data('id');
      var resp = confirm('Remove the user from the Ticket?');
      if(resp) this.model.unassignUser(id);
    }

  });

  return TicketAssignView;
});