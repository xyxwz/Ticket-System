/* BackHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
'text!templates/headers/Back.html', 'text!templates/headers/AssignPullTab.html',
'outsideEvents', 'jqueryui/draggable'],
function($, _, Backbone, BaseView, HeaderTmpl, PullTabTmpl) {

  var BackHeadersView = BaseView.extend({

    events: {
      "click li#back": "navigateBack",
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

    navigateBack: function(e) {
      e.preventDefault();
      window.history.back();
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
        $('ul#assignees', self.el).append(Mustache.to_html(PullTabTmpl, admin.toJSON()));
      });

      $('ul#assignees li', this.el).draggable({
        revert: true,
        helper: "clone",
        scope: "assigned_to",
        cursorAt: {
          top: 28,
          left: 69,
        },
      });

      this.bindTo($('.pullTab .tab', this.el), 'click', this.togglePullTab);
      this.bindTo($('.pullTab', this.el), 'clickoutside', this.hidePullTab);
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
    },

  });

  return BackHeadersView;
 });