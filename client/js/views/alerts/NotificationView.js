define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/alerts/Notification.html'],
function($, _, Backbone, mustache, NotificationTmpl) {

  var NotificationView = Backbone.View.extend({

    id: "notification",
    className: "clearfix",
    tagName: "div",

    events: {
      "click button": "requestPermissions"
    },

    initialize: function() {
      _.bindAll(this);
      ticketer.EventEmitter.on('comment:new', this.fireNotification);
    },

    render: function() {
      $(this.el).html(Mustache.to_html(NotificationTmpl, {})).hide();
      $('body').prepend(this.el);
      $(this.el).slideDown(200);
    },

    requestPermissions: function() {
      $(this.el).hide();
      var self = this;
      webkitNotifications.requestPermission(self.requestCallback);
    },

    requestCallback: function() {
      var status = webkitNotifications.checkPermission();
      if (status === 0) {
        ticketer.notifications = true;
      } else {
        ticketer.notifications = false;
      }
    },

    fireNotification: function(message) {
      if(ticketer.notifications && message.participating) {
        var title = "New Comment From " + message.user.name;
        webkitNotifications.createNotification('', title, message.comment).show();
      }
    }

  });

  return NotificationView;
});