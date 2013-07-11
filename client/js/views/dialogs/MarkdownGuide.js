/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'text!templates/dialogs/MarkdownGuide.html'
],
function($, _, Backbone, BaseView, mustache, tmpl_MarkdownGuide) {

  var MarkdownGuide = BaseView.extend({
    className: 'dialog',
    events: {
      "click .close": "destroy"
    },

    initialize: function() {
      this.render();

      $('body').on('keyup', $.proxy(this.escape, this));
      $('body').on('click', $.proxy(this.clickOutside, this));
    },

    render: function() {
      if($('body').find('.dialog').length) return;

      this.$el.html(Mustache.to_html(tmpl_MarkdownGuide));
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
    }

  });

  return MarkdownGuide;
});