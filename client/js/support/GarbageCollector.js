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
     * Remove a child view if `filter` returned true
     *
     * @param {function} filterFn
     * @return {Object}
     */

    removeView: function(filterFn) {
      var i, views = [];

      for(i = this.views.length - 1; i >= 0; i--) {
        if(filterFn(this.views[i]) === true) {
          views.push(this.views[i]);
          this.views[i].dispose();
          this.views.splice(i, 1);
        }
      }

      return views;
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
        callback: callback,
        context: context
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
        binding.item.off(binding.ev, binding.callback, binding.context);
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
     * Clean up all children views
     */

    removeChildren: function() {
      var i, view;

      for(i = this.views.length; i > 0; i = i - 1) {
        view = this.views.pop();
        view.dispose();
      }
    },

    /**
     * Remove all children views, unbind events, remove any dangeling events,
     *  and remove the node from the `DOM`.
     *
     * @return {Null}
     */

    dispose: function () {
      this.removeChildren();
      this.unbindAll();
      this.clearIntervals();
      this.remove();

      return null;
    }
  });

  BaseView.extend = Backbone.View.extend;

  return BaseView;
});
