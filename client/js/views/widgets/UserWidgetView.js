/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/widgets/UserWidget.html',
  'text!templates/widgets/User.html'],
function($, _, Backbone, BaseView, mustache, tmpl_UserWidget, tmpl_User) {

  /**
   * Widget to help with user assignment
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection users to search from
   */

  var UserWidgetView = BaseView.extend({
    tagName: 'li',
    className: 'widget user-widget',
    events: {
      "click [data-action='display']": "bindEvents",
      "blur [data-action='assign']": "unbindEvents",
      "click [data-role='results-list'] li": "assignUser"
    },

    initialize: function() {
      _.bindAll(this);
      this.$el.attr('data-role', 'assign-user');
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_UserWidget));

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
     * Bind events on `click` of the `display` button
     *
     * @param {jQuery.Event} e
     */

    bindEvents: function(e) {
      var element = this.$el.find('input');

      this.bindTo(element, 'keyup', this.renderFilteredResults);
      this.$el.find('a').hide();
      this.$el.find('input').fadeIn(200).focus();

      e.preventDefault();
    },

    /**
     * Unbind previously bound events on `input` `blur`
     *
     * @param {jQuery.Event} e
     */

    unbindEvents: function(e) {
      var self = this;

      this.unbind('keyup');

      this.$el.find('.results-list, input').fadeOut(200, function() {
        self.$el.find('input').val('');
        self.$el.find('a').show(200);
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