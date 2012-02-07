/* FullHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/headers/MainHeader.html', 'text!templates/headers/AssignPullTab.html',
'outsideEvents', 'jqueryui/draggable'],
function($, _, Backbone, BaseView, mustache, HeaderTmpl, PullTabTmpl) {

  var MainHeadersView = BaseView.extend({

    className: "row",
    tagName: "header",

    events: {
      "click #createTicket"  : "navigateToForm",
      "click #myTickets"     : "toggleMyTickets",
      "click #openTickets"   : "toggleOpen",
      "click #closedTickets" : "toggleClosed"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var ViewData = {};
      ViewData.showAdmin = this.renderAdminOptions();
      $(this.el).html(Mustache.to_html(HeaderTmpl, ViewData));

      if(ViewData.showAdmin) this.renderAssignees();

      return this;
    },

    /* Does user have the role of admin? */
    renderAdminOptions: function() {
      if(ticketer.currentUser.role === 'admin') {
        return true;
      }
      else {
        return false;
      }
    },

    renderAssignees: function() {
      var self = this,
          admins = ticketer.collections.admins;

      _.each(admins.models, function(admin) {
        var data = admin.toJSON();
        data.shortname = data.name.split(' ')[0];
        $('ul#assignees', self.el).append(Mustache.to_html(PullTabTmpl, data));
      });

      $('ul#assignees li', this.el).draggable({
        revert: true,
        helper: "clone",
        scope: "assigned_to",
        zIndex: 302,
        cursorAt: {
          top: 28,
          left: 69
        }
      });

      this.bindTo($('.pullTab .tab', this.el), 'click', this.togglePullTab);
      this.bindTo($('.pullTab', this.el), 'clickoutside', this.hidePullTab);
    },

    navigateToForm: function() {
      ticketer.routers.ticketer.navigate("tickets/new", true);
    },

    toggleMyTickets: function() {
      ticketer.routers.ticketer.navigate("tickets/activity", true);
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
        $('li', this.el).removeClass('yellow');
        $('#' + tab, this.el).addClass('yellow');
      }
    },

    toggleAssign: function(tab) {
      var self = this;

      if(tab === 'closedTickets') {
        if($('.pullTab', self.el).css('display') != 'none') {
          $('.pullTab', self.el).hide();
        }
      }
      else {
        if($('.pullTab', self.el).css('display') == 'none') {
          $('.pullTab', self.el).fadeIn(200);
        }
      }
    },

    /* Toggles PullTab Menu Up or Down */
    togglePullTab: function(e) {
      var tab = $(e.currentTarget).closest('.pullTab'),
          content = $('.scroll', tab);

      $(content).is(':hidden') ? this.showPullTab(e) : this.hidePullTab(e);
    },

    showPullTab: function(e) {
      var tab = $(e.currentTarget).closest('.pullTab'),
          content = $('.scroll', tab);

      if( $(content).is(':hidden') ) {
        $(tab).removeClass('shadow').addClass('lightShadow');
        $(content).slideDown(200);
      }
    },

    hidePullTab: function(e) {
      var tab = $(e.currentTarget).closest('.pullTab'),
          content = $('.scroll', tab);

      if( $(content).is(':visible') ) {
        $(content).slideUp(200, function() {
          $(tab).removeClass('lightShadow').addClass('shadow');
        });
      }
    }

  });

  return MainHeadersView;
 });