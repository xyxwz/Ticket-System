/**
 * View Dependencies
 */

define([
  'jquery',
  'underscore',
  'BaseView',
  'spin'
],
function($, _, BaseView, Spinner) {

  /**
   * A simple view for rendering a spinner
   */

  var SpinnerView = BaseView.extend({
    className: "spin-wrap",

    initialize: function() {
      this.opts = {
        lines: 11, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };
    },

    render: function() {
      var spinner = new Spinner(this.opts).spin();
      this.$el.html(spinner.el);
      this.$el.append("<p>Loading</p>");
      return this;
    }
  });

  return SpinnerView;
});