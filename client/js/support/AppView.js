/* AppView
 * 
 * Manages Garbage Collection on view renders
 */
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
  
  function AppView() {

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

    /* Manages Headers
     *
     * Manage automatic garbage collection of headers.
     * Headers have a different lifecycle than the main
     * content and should only be destroyed and transitioned
     * when needed.
     */
    this.showHeader = function(header, args) {
      var self = this;

      // toggle assign pulltab off by default
      if(!args) args = { status: 'closed' };

      if (this.currentHeader && this.headerView) {
        /* If new header dispose of old header and
         * transition to new one */
        if (this.headerView != header) {
          this.currentHeader.dispose();
          this.headerView = null;
          this.currentHeader = new header();
          this.headerView = header;
          this.currentHeader.render();

          $('header').fadeOut(200, function() {
            $(this).html(self.currentHeader.el);
            if(args.tab) { self.toggleHeaderTab(args.tab); }
            if(args.status) { self.currentHeader.toggleAssign(args.status); }
          }).fadeIn(200);

          return;
        }

        /* Not a new header so just toggle tabs if available */
        if(args.tab) { self.toggleHeaderTab(args.tab); }
        if(args.status) { self.currentHeader.toggleAssign(args.status); }
      }

      else {
        /* No header exists so create one */
        this.currentHeader = new header({admin: true});
        this.headerView = header;
        this.currentHeader.render();

        $('header').fadeOut(200, function() {
          $(this).html(self.currentHeader.el);
          if(args.tab) { self.toggleHeaderTab(args.tab); }
          if(args.status) { self.currentHeader.toggleAssign(args.status); }
        }).fadeIn(200);
      }

    };

    this.toggleHeaderTab = function(tab) {
      // If tab variable set correct highlight on tab
      if(typeof(tab) != 'undefined' && typeof(this.currentHeader.toggleTab) === 'function') {
        this.currentHeader.toggleTab(tab);
        this.currentHeader.toggleAssign(tab);
      }
    };

  };

  return AppView;
});