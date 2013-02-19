define(['jquery', 'underscore', 'backbone'],
function($, _, Backbone) {

  var BaseAlertView = Backbone.View.extend({
    id: "alert",
    events: {
      "click .close" : "close"
    },

    close: function(e) {
      if(e.type === 'click') e.preventDefault();

      var self = this;

      $(this.el).slideUp(200, 'swing', function() {
        $('.alert', self).remove();
      });

      $('body').off('mousedown DOMMouseScroll mousewheel touchstart touchmove', self.close);
    }

  });

  return BaseAlertView;
});