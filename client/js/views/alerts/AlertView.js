define(['jquery', 'underscore', 'backbone', 'views/alerts/BaseAlertView', 'mustache',
'text!templates/alerts/Alert.html'],

function($, _, Backbone, BaseAlertView, mustache, AlertTmpl) {

  var AlertView = BaseAlertView.extend({

    initialize: function() {
      _.bindAll(this);

      this.ticketCount = 0;

      ticketer.EventEmitter.on('ticket:new', this.render);
    },

    render: function() {
      if(ticketer.currentUser.role != 'admin') { return false; }
      this.ticketCount++;

      if($(this.el).is(':visible')) {
        $(this.el).html(Mustache.to_html(AlertTmpl, { count: this.ticketCount }));
      }
      else {
        $(this.el).html(Mustache.to_html(AlertTmpl, { count: this.ticketCount })).hide();
        $('body').prepend(this.el);
        $(this.el).slideDown(200);
      }

      this.trackIdle();
    },

    trackIdle: function() {
      var self = this;
      $('body').on('mousedown DOMMouseScroll mousewheel touchstart touchmove', function(e) {
        self.close(e);
        self.ticketCount = 0;
      });
    }

  });

  return AlertView;
});
