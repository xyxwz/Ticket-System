/* AppView
 * 
 * Manages Garbage Collection on view renders
 */
define(['jquery', 'backbone'], function($, Backbone) {
  
  function AppView() {

    this.showView = function(view) {
      var self = this;

      if (this.currentView){
        this.currentView.dispose();
      }

      this.currentView = view;
      this.currentView.render();

      $('#main').fadeOut('fast', function() {
        $(this).html(self.currentView.el);
      }).fadeIn('fast');
    };

  };

  return AppView;
});