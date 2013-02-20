/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'text!templates/tickets/MarkdownGuide.html'
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
    },

    render: function() {
      if($('body').find('.dialog').length) return;

      this.$el.html(Mustache.to_html(tmpl_MarkdownGuide));
      $('body').append(this.el);
      this.$el.animate({ 'top': '18%' });
    },

    escape: function(e) {
      var self = this;
      e.preventDefault();

      if(e.which == 27) {
        $('body').off('keyup', this.escape);
        self.destroy(e);
      }
    },

    destroy: function(e) {
      var self = this;
      e.preventDefault();

      this.$el.fadeOut(200, function() {
        self.dispose();
      });
    }

  });

  return MarkdownGuide;
});