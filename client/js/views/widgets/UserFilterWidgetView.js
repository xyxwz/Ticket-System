/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'text!templates/widgets/UserFilterWidget.html',
  'text!templates/widgets/MinimalUser.html'],
function($, _, Backbone, BaseView, tmpl_Base, tmpl_User) {

  /**
   * UserFilterWidget
   * Renders a collection of Tags
   *
   * @param {Backbone.Collection} collection
   */

  var UserFilterWidget = BaseView.extend({
    className: 'option-set user-filter-widget',

    events: {
      "click .user[data-id]": "filterListView"
    },

    initialize: function() {
      this.bindTo(this.collection, 'reset', this.renderUsers, this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Base));
      this.renderUsers();

      return this;
    },

    /**
     * Generate an array of all user markup and
     * render to the element
     */

    renderUsers: function() {
      var html = [],
          self = this,
          users = this.collection;

      if(users.length) {
        users.each(function(user) {
          html.push(self.renderUser(user));
        });
      } else {
        html.push('<li class="empty">No users to display</li>');
      }

      this.$el.find('.group').html(html.join(''));
    },

    /**
     * Render a single user model
     *
     * @param {Backbone.model} tag
     */

    renderUser: function(user) {
      return Mustache.to_html(tmpl_User, user.toJSON());
    },

    /**
     * Get the clicked tag id, retrieve it's tickets,
     * and fire a filter event with the corresponding
     * filter function.
     *
     * @param {jQuery.Event} e
     */

    filterListView: function(e) {
      var target = $(e.currentTarget),
          user = this.collection.get(target.data('id'));

      // Named user filter for filter removal
      function userFilter(ticket) {
        return ticket.get('user').id === user.id;
      }

      if(target.hasClass('active')) {
        target.removeClass('active');
        ticketer.EventEmitter.trigger('list:filter', this);
      }
      else {
        target.siblings().removeClass('active');
        target.addClass('active');
        ticketer.EventEmitter.trigger('list:filter', userFilter, this);
      }
    }

  });

  return UserFilterWidget;
});