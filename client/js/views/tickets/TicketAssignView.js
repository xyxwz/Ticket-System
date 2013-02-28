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
    className: 'involved-users',

    events: {
      "click li.user": "unFollow"
    },

    initialize: function() {
      // Bindings
      this.bindTo(this.model, 'change:participants', this.render, this);
    },

    /**
     * Adds the User Widget to TicketMetaView
     */

    render: function() {
      var users,
          self = this,
          assigned_to = this.model.get('assigned_to'),
          participants = this.model.get('participants');

      this.$el.empty();

      if(this.widget) {
        this.widget.dispose();
      }

      // TODO: This can be changed to just render `assigned_to` in the future
      if(assigned_to.length) {
        assigned_to.forEach(function(id) {
          var user = ticketer.collections.users.get(id),
              html = Mustache.to_html(tmpl_User, user.toJSON());

          self.$el.append($(html).addClass('assigned'));
        });
      }

      users = ticketer.collections.users.filter(function(user) {
        return ~participants.indexOf(user.id) && !~assigned_to.indexOf(user.id);
      });

      users.forEach(function(user) {
        self.$el.append(Mustache.to_html(tmpl_User, user.toJSON()));
      });

      if(ticketer.currentUser.role !== 'admin' && participants.indexOf(ticketer.currentUser.id) >= 0) return this;

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

    unFollow: function(e) {
      var id = $(e.currentTarget).data('id'),
          role = ticketer.currentUser.role,
          rep;

      if(role === 'admin') {
        resp = confirm('Remove the user from the Ticket?');
        if(resp) this.model.stopParticipating(id);
      } else {
        if(id === ticketer.currentUser.id) {
          resp = confirm('Unfollow this Ticket?');
          if(resp) this.model.unfollow();
        }
      }
    }
  });

  return TicketAssignView;
});