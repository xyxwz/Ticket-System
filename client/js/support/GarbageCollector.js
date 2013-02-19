/**
 * BaseView
 *
 * Manages views creation and destruction to prevent memory leaks.
 * All views should inherit from BaseView to allow proper
 * Garbage Collection on view destruction.
 */

define(['jquery', 'underscore','backbone'], function($, _, Backbone) {

  var BaseView = function(options) {
    this.bindings = [];
    this.views = [];
    this.intervals = [];
    Backbone.View.apply(this, [options]);
  };

  _.extend(BaseView.prototype, Backbone.View.prototype, {

    /**
     * Create a new `View` with options `options`
     * within the current view. `View` must extend `BaseView`.
     *
     * @param {BaseView} View
     * @param {Object} options
     */

    createView: function(View, options) {
      var view = new View(options);
      this.views.push(view);
      return view;
    },

    /**
     * Create an interval and save the callback to
     * be cleared on view disposal.
     *
     * @param {Number} dx
     * @param {Function} callback
     */

    createInterval: function(dx, callback) {
      var interval = setInterval(callback, dx);
      this.intervals.push(interval);
      return interval;
    },

    /**
     * Bind handler `callback` to event `ev` on object
     * `item` and store the binding to unbinding on view disposal.
     *
     * @param {Backbone.Events} item
     * @param {String} ev
     * @param {Function} callback
     */

    bindTo: function(item, ev, callback, context) {
      this.bindings.push({
        item: item,
        ev: ev,
        callback: callback
      });

      return item.on(ev, callback, context);
    },

    /**
     * Pop off all events from `this.bindings` and call `off` on all,
     * removing the event bindings from each saved `item`.
     *
     * Then call `this.off` to remove all events that might not
     * have been bound with `this.bindTo`.
     */

    unbindAll: function() {
      var i, binding;

      for(i = this.bindings.length; i > 0; i = i - 1) {
        binding = this.bindings.pop();
        binding.item.off(binding.ev, binding.callback);
      }

      this.off();
    },

    /**
     * Pop off all intervals from `this.intervals`
     * and clear each
     */

    clearIntervals: function() {
      var i, interval;

      for(i = this.intervals.length; i > 0; i = i - 1) {
        interval = this.intervals.pop();
        clearInterval(interval);
      }
    },

    /**
     * A helper function for `this.dispose`
     * unbinds events, removes any dangeling events,
     * and removes the node from the `DOM`
     */

    trash: function() {
      this.unbindAll();
      this.clearIntervals();
      this.remove();

      delete this.el;
      delete this.$el;

      return null;
    },

    /**
     * Iterate over all views stored in `this.views`
     * and dispose of each before finally calling `this.trash`
     */

    dispose: function () {
      var i, view;

      for(i = this.views.length; i > 0; i = i - 1) {
        view = this.views.pop();
        view.dispose();
      }

      return this.trash();
    }
  });

  BaseView.extend = Backbone.View.extend;

  return BaseView;
});
