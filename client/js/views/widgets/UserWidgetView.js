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
    attributes: {'data-role': 'assign-user'},

    events: {
      "click [data-action='display']": "bindEvents",
      "blur [data-action='assign']": "unbindEvents",
      "click [data-role='results-list'] li": "assignUser"
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
     * Render a filtered results list, if enter was pressed assign
     * the .active user; If the down arrow was pressed, make the next child .active
     *
     * TODO: This function is probably extremely heavy
     *
     * @param {jQuery.Event} e
     */

    renderFilteredResults: function(e) {
      var next,
          val = $(e.currentTarget).val(),
          element = this.$el.find('[data-role="results-list"]'),
          activeElement = element.children('.active');

      // On enter, assign the active user
      if(e.keyCode === 13 && activeElement.length) {
        this.model.assignUser(activeElement.data('id'));
      }
      else if(e.keyCode === 40 && activeElement.length) {
        // Wrap the activeElement index + 1
        next = (activeElement.index() + 1) % element.children().length;

        activeElement.removeClass('active');
        $(element.children().get(next)).addClass('active');
      }
      else {
        // There must be something to worth searching for...
        if(val.replace(/\s+/g, '').length) {
          element.html(this.filterUsers(val.toLowerCase())).fadeIn(400);
          element.children(':first').addClass('active');
        }
        else {
          element.empty();
        }
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
      this.$el.find('input').on('keyup', this.renderFilteredResults.bind(this));
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

      this.$el.find('input').off('keyup');
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
      e.stopPropagation();
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
      e.stopPropagation();
      this.model.unassignUser(id);
    }
  });

  return UserWidgetView;
});