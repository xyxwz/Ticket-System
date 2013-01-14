/* AppView
 *
 * Manages Garbage Collection on view renders
 */
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

  function AppView() {

    /**
     * Manages the toolbar creation and destruction
     */

    this.showToolbar = function(view, args) {
      if(this.currentToolbar) {
        this.currentToolbar.dispose();
      }

      this.currentToolbar = new view(args);
      this.currentToolbar.render();

      $('#sidebar').html(this.currentToolbar.el);
    };

    this.showToolbarTab = function(tab) {
      this.currentToolbar.selectTab(tab);
    };

    /**
     * Manages the main application view
     * destruction and creation
     */

    this.showView = function(view, cb) {
      var self = this;

      if (this.currentView){
        this.currentView.dispose();
      }

      this.currentView = view;
      this.currentView.render();

      $('#main').fadeOut(200, function() {
        $(this).html(self.currentView.el);
      }).fadeIn(200, cb);
    };
  }

  return AppView;
});