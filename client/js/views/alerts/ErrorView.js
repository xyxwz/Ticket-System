define(['jquery', 'underscore', 'backbone', 'views/alerts/BaseAlertView', 'mustache',
'text!templates/alerts/Error.html'],

function($, _, Backbone, BaseAlertView, mustache, ErrorTmpl) {

  var ErrorView = BaseAlertView.extend({

    initialize: function() {
      ticketer.EventEmitter.on('error', this.render, this);
    },

    render: function(msg) {
      $(this.el).html(Mustache.to_html(ErrorTmpl, { msg: msg })).hide();
      $('body').prepend(this.el);
      $(this.el).slideDown(200, function() {
        var el = this;

        setTimeout(function() {
          dispose();
        }, 4000);

        function dispose() {
          $(el).slideUp(200, function(){
            $('.alert', el).remove();
          });
        }
      });
    }

  });

  return ErrorView;
});
