define(['jquery', 'underscore', 'backbone', 'views/alerts/BaseAlertView', 'mustache',
'text!templates/alerts/Alert.html'],

function($, _, Backbone, BaseAlertView, mustache, Tmpl) {

  var AlertView = BaseAlertView.extend({

    initialize: function() {
      ticketer.EventEmitter.on('alert', this.render, this);
    },

    render: function(msg) {
      if(this.$el.children('.alert').length) return;

      this.$el.html(Mustache.to_html(Tmpl, { msg: msg })).hide();
      $('body').prepend(this.el);
      this.$el.slideDown(200, function() {
        var el = $(this);

        setTimeout(function() {
          dispose();
        }, 5000);

        function dispose() {
          el.slideUp(200, function(){
            el.children('.alert').remove();
          });
        }
      });
    }

  });

  return AlertView;
});
