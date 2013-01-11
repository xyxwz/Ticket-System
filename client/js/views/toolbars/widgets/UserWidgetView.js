/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/toolbars/widgets/Widget.html',
  'text!templates/toolbars/widgets/User.html'],
function($, _, Backbone, BaseView, mustache, WidgetTmpl, UserTmpl) {

  /**
   * Widget to help with user assignment
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection users to search from
   */

  var UserWidgetView = BaseView.extend({
    tagName: 'li',
    className: 'widget',
    events: {
      "focus [data-action='assign']": "bindEvents",
      "blur [data-action='assign']": "unbindEvents",
      "click [data-role='results-list'] li": "assignUser",
      "click .user [data-action='remove']": "unassignUser"
    },

    initialize: function() {
      _.bindAll(this);
      this.$el.attr('data-role', 'user-widget');

      this.bindTo(this.model, 'change:assigned_to', this.renderAssignedUsers);
    },

    render: function() {
      this.$el.html(Mustache.to_html(WidgetTmpl, {
        placeholder: "Assign user..."
      }));

      this.renderAssignedUsers();
      return this;
    },

    /**
     * Render all users assigned to `this.model`
     */

    renderAssignedUsers: function() {
      var i, len, user,
          element = $('[data-role="assigned-objects"]', this.$el),
          assigned = this.model.get('assigned_to');

      if(element.length) element.empty();

      for(i = 0, len = assigned.length; i < len; i++) {
        user = this.collection.get(assigned[i]);
        if(user) {
          user = user.toJSON();
          user.isRemovable = true;
          element.append(this.renderUser(user));
        }
      }
    },

    /**
     * Return the rendered html for one user object
     *
     * @param {Object} user
     * @return {String}
     */

    renderUser: function(user) {
      return Mustache.to_html(UserTmpl, user);
    },

    /**
     * Render a filtered results list
     *
     * @param {jQuery.Event} e
     */

    renderFilteredResults: function(e) {
      var val = $(e.currentTarget).val(),
          element = $('[data-role="results-list"]', this.$el);

      element.html(this.filterUsers(val)).fadeIn(400);
    },

    /**
     * Filter users by the given `input` and return the rendered html
     *
     * @param {String} input
     * @return {String}
     */

    filterUsers: function(input) {
      var self= this,
          results = [];

      this.collection.each(function(user) {
        var name = user.get('name').toLowerCase();

        // user.name contains input and is not already added
        if(input.length && ~name.indexOf(input) &&
            !~self.model.get('assigned_to').indexOf(user.id)) {
          results.push(self.renderUser(user.toJSON()));
        }
      });

      // List up to 4 results
      return results.slice(0, 4).join('');
    },

    /**
     * Bind events on `focus` of the input field
     *
     * @param {jQuery.Event} e
     */

    bindEvents: function(e) {
      var element = $(e.currentTarget);
      this.bindTo(element, 'keyup', this.renderFilteredResults);
    },

    /**
     * Unbind previously bound events on `blur`
     *
     * @param {jQuery.Event} e
     */

    unbindEvents: function(e) {
      var element = $(e.currentTarget);
      this.unbind('keyup');

      $('[data-role="results-list"]', this.$el).fadeOut(200, function() {
        $(this).empty();
        element.val('');
      });
    },

    /**
     * Assigns the clicked results-list item to `this.model`
     *
     * @param {jQuery.Event} e
     */

    assignUser: function(e) {
      var id = $(e.currentTarget).data('id');

      e.preventDefault();
      this.model.assignUser(id);
    },

    /**
     * Unassigns the clicked user list item from `this.model`
     *
     * @param {jQuery.Event} e
     */

    unassignUser: function(e) {
      var id = $(e.currentTarget).parent().data('id');

      e.preventDefault();
      this.model.unassignUser(id);
    }
  });

  return UserWidgetView;
});