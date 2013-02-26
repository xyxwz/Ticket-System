/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/widgets/UserWidgetView',
  'text!templates/tickets/AssignedUser.html'],
function($, _, mustache, BaseView, UserWidget, tmpl_User) {

  /**
   * TicketFollowView
   * render a ticket follow button
   *
   * @param {Backbone.Model} model
   */

  var TicketFollowView = BaseView.extend({
    className: 'follow button',

    events: {
      "click": "follow"
    },

    initialize: function() {
      // Bindings
      this.bindTo(this.model, 'change:participating', this.render, this);
    },

    /**
     * Adds the Follow/Unfollow Button to TicketMetaView
     */

    render: function() {
      var text;

      if(this.model.get('participating')) {
        text = "<i class='icon-minus'></i> Unfollow";
      } else {
        text = "<i class='icon-plus'></i> Follow";
      }

      this.$el.html(text);
      return this;
    },

    follow: function(e) {
      var self = this,
          clone = _.clone(this.model),
          method = this.model.get('participating') ? "delete" : "create";

      clone.url = "/api/tickets/" + clone.get('id') + '/follow';
      Backbone.sync(method, clone, {
        success: function(model, response) {
          self.model.set({participating: response.participating});
        }
      });
    }

  });

  return TicketFollowView;
});