/**
 * PanelController
 * The main controller for ticketer
 */

define([
  'jquery',
  'underscore',
  'views/helpers/FillerView',
  'views/toolbars/MainToolbarView',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView'],
function($, _, FillerView, ToolbarView, ListView, DetailsView) {

  var PanelController = function PanelController() {
    this._panels = {};

    this._setHeight();
    this._setWidths();

    // Display toolbar in panel one by default
    this._setPanel('one', ToolbarView);

    // Bindings
    $(window).resize(this._setHeight);
  };

  /**
   * Display open tickets
   */

  PanelController.prototype.showOpenTickets = function() {
    this._callViewFunction('one', 'selectTab', 'tickets/open');
    this._setPanel('two', ListView, {
      collection: ticketer.collections.openTickets
    });

    this._setPanel('three', FillerView);
  };

  /**
   * Display my tickets
   */

  PanelController.prototype.showMyTickets = function() {
    this._callViewFunction('one', 'selectTab', 'tickets/mine');
    this._setPanel('two', ListView, {
      collection: ticketer.collections.openTickets,
      filter: function(ticket) {
        return ticket.participating();
      }
    });

    this._setPanel('three', FillerView);
  };

  /**
   * Display closed tickets in `panel-two`
   */

  PanelController.prototype.showClosedTickets = function() {
    this._callViewFunction('one', 'selectTab', 'tickets/closed');
    this._setPanel('two', ListView, {
      collection: ticketer.collections.closedTickets
    });

    this._setPanel('three', FillerView);
  };

  /**
   * Display `ticket` in panel-three
   *
   * @param {Backbone.Model} ticket
   */

  PanelController.prototype.showTicket = function(ticket) {
    var self = this;

    this._setPanel('three', DetailsView, {
      model: ticket
    });

    this._callViewFunction('three', 'bindTo', this._panels.three.model, 'remove', function() {
      self._setPanel('three', FillerView);
    });
  };

  /**
   * Populate `panel` with `View` passing #panel-`panel`
   * as the `el` for the `View`
   *
   * @param {String} panel
   * @param {Backbone.View} View
   * @param {Object} options
   */

  PanelController.prototype._setPanel = function(panel, View, options) {
    options = options || {};

    if(this._panels[panel]) {
      this._panels[panel].dispose();
    }

    this._panels[panel] = new View(options);
    $('#panel-' + panel).html(this._panels[panel].render().el);
  };

  /**
   * Call the function `fn` on `panel` with `args`
   * `_callViewFunction(panel, fn, ...args)`
   *
   * @param {String} panel
   * @param {String} fn
   */

  PanelController.prototype._callViewFunction = function() {
    var args = Array.prototype.slice.call(arguments),
        panel = args.shift(),
        fn = args.shift();

    if(typeof panel !== 'string' || typeof fn !== 'string') {
      console.error('Invalid call to _callViewFunction().');
      return;
    }

    if(this._panels[panel] && typeof this._panels[panel][fn] !== 'undefined') {
      this._panels[panel][fn].apply(this._panels[panel], args);
    } else {
      console.error('Attempted to call nonexistent function ' + fn + ' on panel ' + panel);
    }
  };

  /**
   * Sets the height on `#main`
   */

  PanelController.prototype._setHeight = function() {
    var totalHeight = $(window).height(),
        headerHeight = $('header').height() + 1;

    $('#main').css('height', totalHeight - headerHeight);
  };

  /**
   * Sets the width on `#panel-two` and `#panel-three`
   */

  PanelController.prototype._setWidths = function() {
    console.error('Set widths not implemented');
  };

  return PanelController;
});