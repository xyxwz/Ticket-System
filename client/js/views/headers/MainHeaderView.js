/* FullHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/headers/MainHeader.html', 'text!templates/headers/AssignPullTab.html'],
function($, _, Backbone, BaseView, mustache, HeaderTmpl, PullTabTmpl) {

  var MainHeadersView = BaseView.extend({

    events: {
      "click #createTicket"  : "navigateToForm",
      "click #myTickets"     : "toggleMyTickets",
      "click #openTickets"   : "toggleOpen",
      "click #closedTickets" : "toggleClosed",
    },

    initialize: function() {
      _.bindAll(this);
      this.admin = this.options.admin;
    },

    render: function() {
      var ViewData = {};
      ViewData.showAdmin = this.renderAdminOptions();

      $(this.el).html(Mustache.to_html(HeaderTmpl, ViewData));

      if(ViewData.showAdmin) this.renderAssignees();

      /* Animation for Pull Tabs */
      $('.pullTab .tab', this.el).click(function() {
        var tab = $(this).parent().parent(),
        content = $('ul', tab).first();

        if( $(content).is(':visible') ) {
          $(content).slideUp(200, function() {
            $(tab).removeClass('lightShadow').addClass('shadow');
          });
        }
        else {
          $(tab).removeClass('shadow').addClass('lightShadow');
          $(content).slideDown(200);
        }
      });

      return this;
    },

    /* Set this.admin to true when instantiating a view
     * if admin options are needed. Access control is done on
     * a per view basis by checking currentUser.role
     */
    renderAdminOptions: function() {
      var self = this;

      if(this.admin && this.admin === true) {
        if(ticketer.currentUser.role === 'admin') {
          return true;
        }
        else {
          return false;
        }
      }
    },

    renderAssignees: function() {
      var self = this,
          admins = ticketer.collections.users.admins();

      _.each(admins, function(admin) {
        $('ul#assignees', self.el).append(Mustache.to_html(PullTabTmpl, admin.toJSON()));
      });
    },

    navigateToForm: function() {
      ticketer.routers.ticketer.navigate("tickets/new", true);
    },

    toggleMyTickets: function() {
      // TODO
    },

    toggleOpen: function() {
      ticketer.routers.ticketer.navigate("tickets/open", true);
    },

    toggleClosed: function() {
      ticketer.routers.ticketer.navigate("tickets/closed", true);
    },

    /* Sets the correct highlighted state (.yellow) on
     * the selected tab. Checks that the tab isn't currently 
     * highlighted then clears out all highlights on the tabs 
     * and adds class to correct tab.
     *    :tab - a div ID to represent the desired page tab
     */
    toggleTab: function(tab) {
      if ($('#' + tab + ' .yellow', 'header').length === 0) {
        $('header li').removeClass('yellow');
        $('#' + tab, 'header').addClass('yellow');
      }
    },

  });

  return MainHeadersView;
 });