/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache', 'ZeroClipboard',
  'text!templates/dialogs/CopyTicketPath.html'
],
function($, _, Backbone, BaseView, mustache, ZeroClipboard, tmpl_CopyTicketPath) {

  var CopyTicketPath = BaseView.extend({
    className: 'dialog',

    events: {
      "click .close": "destroy",
      "click #copyButton": "copy"
    },

    initialize: function() {
      this.render();

      // Initialize ZeroClipboard instance and change prompt if flash disabled on old browser
      var clip = new ZeroClipboard($("#copyButton"));
      try {
        if(ZeroClipboard.isFlashUnusable() && !document.queryCommandEnabled("copy"))
          $('#copyButton').html("Press Ctrl+C to copy");
      } catch (err) {
        $('#copyButton').html("Press Ctrl+C to copy");
      }

      $('body').on('keyup', $.proxy(this.escape, this));
      $('body').on('click', $.proxy(this.clickOutside, this));
    },

    setPath: function(path) {
      $('#ticketPath').val(path).select();
    },

    render: function() {
      if($('body').find('.dialog').length) return;

      this.$el.html(Mustache.to_html(tmpl_CopyTicketPath));
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
      if ($(e.target).parents('.dialog').length > 0) {
        $('#ticketPath').select();
        return;
      }
      this.destroy(e);
    },

    // Copy selected path with built in command if possible
    copy: function(e) {
      try {
        if(ZeroClipboard.isFlashUnusable() && document.queryCommandEnabled("copy"))
          document.execCommand("copy");
      } catch (err) { }
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

  return CopyTicketPath;
});