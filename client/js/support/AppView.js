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
      var self = this, el;

      // toggle assign pulltab off by default
      if(!args) args = { status: 'closed' };

      if (this.currentHeader && this.headerView) {
        /* If new header dispose of old header and
         * transition to new one */
        if (this.headerView != header) {
          $(this.currentHeader.el).fadeOut(200, function() {
            self.currentHeader.dispose();
            self.headerView = null;
            self.currentHeader = new header();
            self.headerView = header;
            el = self.currentHeader.render().el;
            $(el).hide();
            if(args.tab) { self.toggleHeaderTab(args.tab); }
            if(args.status) { self.currentHeader.toggleAssign(args.status); }
            $('#tabs .container').append(el);
            $(el).fadeIn(200);
          });

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
        el = this.currentHeader.render().el;

        // Toogle Tab and Assignees then fade in
        $(el).hide();
        if(args.tab) { this.toggleHeaderTab(args.tab); }
        if(args.status) { this.currentHeader.toggleAssign(args.status); }
        $('#tabs .container').append(el);
        $(el).fadeIn(200);
      }

    };

    this.toggleHeaderTab = function(tab) {
      // If tab variable set correct highlight on tab
      if(typeof(tab) != 'undefined' && typeof(this.currentHeader.toggleTab) === 'function') {
        this.currentHeader.toggleTab(tab);
        this.currentHeader.toggleAssign(tab);
      }
    };

  }

  return AppView;
});