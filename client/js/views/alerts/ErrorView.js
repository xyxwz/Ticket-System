define(['jquery', 'underscore', 'backbone', 'views/alerts/BaseAlertView', 'mustache',
'text!templates/errors/Error.html'],

function($, _, Backbone, BaseAlertView, mustache, ErrorTmpl) {

  var ErrorView = BaseAlertView.extend({

    initialize: function() {
      _.bindAll(this);

      ticketer.EventEmitter.on('error', this.render);
    },

    render: function(msg) {
      $(this.el).html(Mustache.to_html(ErrorTmpl, { error: msg })).hide();
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
