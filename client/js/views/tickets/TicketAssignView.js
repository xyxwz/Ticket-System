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
      "click li.removable": "unFollow"
    },

    initialize: function() {
      // Bindings
      this.bindTo(this.model, 'change:participants', this.render, this);
    },

    /**
     * Adds the User Widget to TicketMetaView
     */

    render: function() {
      var i, len, user, html,
          users = ticketer.collections.users,
          assigned_to = this.model.get('assigned_to'),
          participants = this.model.get('participants');

      this.$el.empty();

      if(this.widget) {
        this.widget.dispose();
      }

      // TODO: This can be changed to just render `assigned_to` in the future
      if(assigned_to.length) {
        for(i = 0, len = assigned_to.length; i < len; i = i + 1) {
          user = users.get(assigned_to[i]);

          // Account for deleted users
          if(user) {
            html = $(Mustache.to_html(tmpl_User, user.toJSON()));
            this.$el.append(html.addClass('assigned'));
          }
        }
      }

      for(i = 0, len = participants.length; i < len; i = i + 1) {
        // Only render a participant if they were not assigned
        if(assigned_to.indexOf(participants[i]) === -1) {
          user = users.get(participants[i]);

          // Account for deleted users
          if(user) {
            html = $(Mustache.to_html(tmpl_User, user.toJSON()));

            if((ticketer.currentUser.isAdmin() ||
                ticketer.currentUser.id === participants[i]) &&
                this.model.isOpen()) {
              html.addClass('removable');
            }

            this.$el.append(html);
          }
        }
      }

      // Render the follow button only if not already following or admin
      if(this.model.isOpen() && (ticketer.currentUser.isAdmin() ||
          participants.indexOf(ticketer.currentUser.id) === -1)) {
        this.renderWidget();
      }

      // Don't allow actions if the ticket is closed
      if(!this.model.isOpen()) this.undelegateEvents();

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
      var id = $(e.currentTarget).data('id');

      if(ticketer.currentUser.isAdmin()) {
        this.model.removeParticipant(id);
      } else {
        if(id === ticketer.currentUser.id) {
          this.model.removeParticipant(ticketer.currentUser.id);
        }
      }
    }
  });

  return TicketAssignView;
});
