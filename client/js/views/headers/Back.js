/* Back
 * Displays a back button. Views will need to add
 * a binding to actually make it work.
 */

define(['jquery', 'backbone', 'text!templates/headers/Back.html'], 
function($, Backbone, header) {

  var BackHeader = Backbone.View.extend({
    el: $('header'),

    render: function() {
      $(this.el).html(header);
    }
  });

  return BackHeader;
});