/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/widgets/UserList.html',
  'text!templates/widgets/User.html'],
function($, _, Backbone, BaseView, mustache, tmpl_UserList, tmpl_User) {

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
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_UserList, {
        placeholder: "Find a User"
      }));

      return this;
    },

    /**
     * Return the rendered html for one user object
     *
     * @param {Object} user
     * @return {String}
     */

    renderUser: function(user) {
      return Mustache.to_html(tmpl_User, user);
    },

    /**
     * Render a filtered results list
     *
     * @param {jQuery.Event} e
     */

    renderFilteredResults: function(e) {
      var val = $(e.currentTarget).val(),
          element = $('[data-role="results-list"]', this.$el);

      // There must be something to worth searching for...
      if(val.replace(/\s+/g, '').length) {
        element.html(this.filterUsers(val.toLowerCase())).fadeIn(400);
      }
      else {
        element.empty();
      }
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
        if(~name.indexOf(input) &&
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