/**
 * PanelController
 * The main controller for ticketer
 */

define([
  'jquery',
  'collections/Tickets',
  'views/helpers/FillerView',
  'views/helpers/SpinnerView',
  'views/toolbars/MainToolbarView',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView'],
function($, Tickets, FillerView, SpinnerView,
          ToolbarView, ListView, DetailsView) {

  var PanelController = function PanelController() {
    var self = this;

    this._panels = {};

    this._setHeight();
    this._setWidths(this._panelPositions());

    // Display toolbar in panel one by default
    this._setPanel('one', ToolbarView);

    // Set to block after header rendered
    $('#main > div').css('display', 'block');

    // Bindings
    $(window).resize(this._setHeight);
    $('#panel-divider').on('mousedown', function() {
      $('body').addClass('unselectable');

      $(window).on('mousemove', self._resizeWidths.bind(self));
      $(window).one('mouseup', function() {
        $(window).off('mousemove');
        $('body').removeClass('unselectable');
        window.getSelection().empty();
      });
    });
  };

  /**
   * Display open tickets
   */

  PanelController.prototype.showOpenTickets = function() {
    var self = this;
    var collection = new Tickets(null, {
      data: {status: 'open'}
    });

    this._callViewFunction('one', 'selectTab', 'tickets/open');
    this._setPanel('two', SpinnerView);

    collection.fetch({
      success: function() {
        self._setPanel('two', ListView, {
          collection: collection,
          controller: self
        });

        self._setPanel('three', FillerView);
      }
    });
  };

  /**
   * Display my tickets
   */

  PanelController.prototype.showMyTickets = function() {
    var self = this;
    var collection = new Tickets(null, {
      data: {status: 'open'},
      url: '/api/tickets/mine',
      collectionFilter: function(model) {
        return !!model.participating;
      }
    });

    this._callViewFunction('one', 'selectTab', 'tickets/mine');
    this._setPanel('two', SpinnerView);

    collection.fetch({
      success: function() {
        self._setPanel('two', ListView, {
          collection: collection,
          controller: self
        });

        self._setPanel('three', FillerView);
      }
    });
  };

  /**
   * Display closed tickets in `panel-two`
   */

  PanelController.prototype.showClosedTickets = function() {
    var self = this;
    var collection = new Tickets(null, {
      data: {status: 'closed'},
      comparator: function(model) {
        var datum = new Date(model.get('closed_at'));
        var closed_at = datum.getTime();
        return -closed_at;
      }
    });

    this._callViewFunction('one', 'selectTab', 'tickets/closed');
    this._setPanel('two', SpinnerView);

    collection.fetch({
      success: function() {
        self._setPanel('two', ListView, {
          collection: collection,
          status: 'closed',
          controller: self
        });

        self._setPanel('three', FillerView);
      }
    });
  };

  /**
   * Search tickets and shit
   *
   * @param {String} status can be either closed, open, mine
   * @param {String} term search term
   */

  PanelController.prototype.searchTickets = function(status, term) {
    var self = this, collection, query = {status: status};

    if(term.match(/^user:\s+(.+)$/)) {
      query.user = RegExp.$1;
    } else {
      query.title = term;
    }

    collection = new Tickets(null, { data: query });
    this._callViewFunction('one', 'selectTab', 'tickets/' + status);
    this._setPanel('two', SpinnerView);

    collection.fetch({
      success: function() {
        self._setPanel('two', ListView, {
          collection: collection,
          controller: self
        });

        self._setPanel('three', FillerView);
      }
    });
  };

  /**
   * Display `ticket` in panel-three
   *
   * @param {Backbone.Model} ticket
   */

  PanelController.prototype.showTicket = function(ticket) {
    var self = this;
    var spinOnTimeout = setTimeout(function() {
      self._setPanel('three', SpinnerView);
    }, 200);

    ticket.fetch({
      success: function() {
        clearTimeout(spinOnTimeout);
        self._callViewFunction('two', 'selectTicket', ticket.id);

        self._setPanel('three', DetailsView, {
          model: ticket
        });

        self._callViewFunction('three', 'bindTo', self._panels.three.model, 'remove', function() {
          self._setPanel('three', FillerView);
        });
      }
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

    if(this._panels.hasOwnProperty(panel) &&
        typeof this._panels[panel].dispose === 'function') {
      this._panels[panel].dispose();
      delete this._panels[panel];
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
   * Resize the panels determined by their current positions
   *
   * @param {jQuery.Event} e
   */

  PanelController.prototype._resizeWidths = function(e) {
    var panelOne = $('#panel-one');
    var panelTwo = $('#panel-two');
    var panelThree = $('#panel-three');
    var divider = $('#panel-divider');
    var positions = {
      two: {},
      three: {},
      divider: {}
    };

    if(e.pageX > 440 && e.pageX < 1200) {
      positions.divider.left = e.pageX;
      positions.two.width = e.pageX - panelOne.width();
      positions.three.left = e.pageX;

      // Clear width attribute

      this._setWidths(positions);
      this._panelPositions(positions);
    }
  };

  /**
   * Sets the width on all panels with keys in `positions`
   *
   * @param {Objects} positions
   */

  PanelController.prototype._setWidths = function(positions) {
    if(!positions) {
      return;
    }

    Object.keys(positions).forEach(function(key) {
      $('#panel-' + key).css(positions[key]);
    });
  };

  /**
   * If `positions` passed, set the positions of panels,
   * otherwise fetch them from local storage
   *
   * @param {Object} positions
   */

  PanelController.prototype._panelPositions = function(positions) {
    var storage = window.localStorage;

    if(typeof positions !== 'undefined') {
      storage.setItem('panel-positions', JSON.stringify(positions));
      return positions;
    } else {
      return JSON.parse(storage.getItem('panel-positions'));
    }
  };

  return PanelController;
});
