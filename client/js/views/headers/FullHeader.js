/* Full Header - Non Admin Users
 * Displays options for users to navigate the
 * various view pages. Used on the TicketsList
 * view.
 */

define(['jquery', 'backbone', 'text!templates/headers/FullHeader.html'], 
function($, Backbone, header) {

  var FullHeader = Backbone.View.extend({
    el: $('header'),

    render: function() {
      $(this.el).html(header);
    }
  });

  return FullHeader;
});