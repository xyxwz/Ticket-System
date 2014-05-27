/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'text!templates/dialogs/Settings.html'
],
function($, _, Backbone, BaseView, mustache, Tmpl) {

  var SettingsDialog = BaseView.extend({
    className: 'dialog',
    events: {
      "click .close": "destroy",
      "change [data-action='save']": "save"
    },

    initialize: function() {
      var self = this;

      this.model.fetch({
        success: function() {
          self.render();
        }
      });

      $('body').on('keyup', $.proxy(this.escape, this));
      $('body').on('click', $.proxy(this.clickOutside, this));
    },

    render: function() {
      if($('body').find('.dialog').length) return;

      this.$el.html(Mustache.to_html(Tmpl, this.model.get('settings')));
      $('body').append(this.el);
      this.$el.animate({ 'top': '18%' });
    },

    // Handle Escape key to close dialog
    escape: function(e) {
      var self = this;
      e.preventDefault();

      if(e.which == 27)
        self.destroy(e);
    },

    // Handle Click Outside to close dialog
    clickOutside: function(e) {
      if ($(e.target).parents('.dialog').length > 0) return;
      this.destroy(e);
    },

    destroy: function(e) {
      var self = this;
      e.preventDefault();

      // Remove Event Listeners
      $('body').off('keyup', this.escape);
      $('body').off('click', this.clickOutside);

      this.$el.fadeOut(200, function() {
        self.dispose();
      });
    },

    save: function(e) {
      var email = this.$el.find("[name='email']").is(':checked'),
          desktop = this.$el.find("[name='desktop']").is(':checked'),
          comments = this.$el.find("[name='inverseComments']").is(':checked');

      this.model.updateSettings({
          desktop: desktop,
          inverseComments: comments
      });
    }

  });

  return SettingsDialog;
});
