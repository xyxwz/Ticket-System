define(['jquery', 'underscore', 'backbone'],
function($, _, Backbone) {

  var BaseAlertView = Backbone.View.extend({

    id: "alert",
    tagName: "div",

    events: {
      "click .close" : "close"
    },

    initialize: function() {
      _.bindAll(this);
    },

    close: function(e) {
      e.preventDefault();

      var self = this;

      $(this.el).slideUp(200, 'swing', function() {
        $('.alert', self).remove();
      });
    }

  });

  return BaseAlertView;
});