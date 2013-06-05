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
      this.bindTo(this.collection, 'add remove reset', this.renderUsers, this);
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
      var self = this,
          html = [];

      if(this.collection.length) {
        this.collection.each(function(user) {
          html.push(self.renderUser(user));
        });
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

      // Toggle functionality
      if(target.hasClass('active')) {
        target.removeClass('active');
        ticketer.EventEmitter.trigger('list:filter');
      }
      else {
        target.siblings().removeClass('active');
        target.addClass('active');

        // Trigger a filter event passing the filter function
        ticketer.EventEmitter.trigger('list:filter', function(ticket) {
          return ticket.get('user').id === user.id;
        });
      }
    }

  });

  return UserFilterWidget;
});