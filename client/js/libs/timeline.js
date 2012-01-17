/* Infinite Scroll + HTML5 History API 
 * Scrolling Class.
 * 
 * http://warpspire.com/experiments/history-api/
 */

define(['jquery', 'backbone'], function($, Backbone) {

  var TimelineClass = (function() {
  
    /* Distance from the bottom that we ask for more tweets, distance from the
     * top that we preload if getting an existing permalink.*/
    Timeline.prototype.infiniteScrollThreshold = 175;

    /* How many pixels do we have to scroll before we permalink the page? */
    Timeline.prototype.permalinkScrollThreshold = 200;

    /* Are there items later than the ones we've shown? */
    Timeline.prototype.laterItemsPossible = true;

    /* Figures out what kind of request to make (is there a max_id present?),
     * makes the request to the API, and activates the scroll event handlers
     * that make infinite scrolling possible.
     *
     * collection     - A Backbone.js Collection that can run the fetch method
     * renderFunction - A function to render a single model to a page.
     *                  Usually the view's render function.
     * wrapperElement - The HTML element to insert the items into. It should
     *                  have a data-url attribute pointing to the desired API
     *                  endpoint.
     *
     * el             - The class name of the items.
     *                  ex: .tweet
     *
     * Returns nothing. */
    function Timeline(collection, renderFunction, wrapperElement, el, args) {
      var self, params, url, objID, item;

      self = this;

      this.collection = collection;
      this.render = renderFunction;
      this.el = el;
      this.args = args;

      this.elements = {
        wrapper: wrapperElement,
        firstItem: wrapperElement.find(this.el + ':first-child'),
        lastItem: wrapperElement.find(this.el + ':last-child')
      };

      this.shouldCheckScroll = false;
      this.didScroll = this.didScroll;
    };

    /* Got some data back from the server, time to parse it!
     *
     *  items   - Array of objects returned from the server.
     *  page    - the page number to append to the item
     *
     * Returns nothing. */
    Timeline.prototype.receivedData = function(items) {
      var model, context, created_at, rendered, scrollOffset, item;

      rendered = (function() {
        var _i, _len, _results;
        _results = [];
        
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          model = this.collection.get(item.id);
          context = this.render(model);
          _results.push(this.elements.wrapper.append(context));
        }
        return _results
      }).call(this);

      this.elements.lastItem = this.elements.wrapper.find(this.el + ':last-child');
      this.elements.firstItem = this.elements.wrapper.find(this.el + ':first-child');
    };

    /* So we've scrolled down the page, do we need to load more items? This
     * analyzes what items are visible and figures out if we need to load more
     * items (either earlier ones or later ones).
     *
     * Returns nothing. */
    Timeline.prototype.didScroll = function() {
      var self, bottomOfLastItem, scrolledDownEnough, scrolledUpEnough, topOfFirstItem, item, page, visibleBottom, _i, _len, _ref, _results;
      
      self = this;

      if (!this.shouldCheckScroll) {
        return;
      }
      this.shouldCheckScroll = false;

      // Get more items for infinite scroll
      visibleBottom = $(document).scrollTop() + $(window).height();
      topOfFirstItem = this.elements.firstItem.offset().top;
      bottomOfLastItem = this.elements.lastItem.outerHeight() + this.elements.lastItem.offset().top;

      // Get more items for infinite scroll downwards?
      if (this.laterItemsPossible && ((bottomOfLastItem - visibleBottom) < this.infiniteScrollThreshold)) {
        page = this.collection.page + 1;
        this.collection.fetch({
          add: true,
          data: {page: page, status: this.args.status},
          success: function(collection, response) {
            if (response.length != 0) self.collection.page = page;
            self.receivedData(response);
          },
        });
      }
    };

    return Timeline;

  })();

  return TimelineClass
});