/* Namespace of all used templates, each takes
 * in a object and returns a rendered template.
 * ex: renders.NewTicket(this.toJSON()); */

var renders = renders || {};

(function() {

  renders.NewTicket = function(ticket) {

    var template = '';

    return Mustache.to_html(template, ticket);

  };

  renders.DisplayTicket = function(ticket) {

    var template = '';

    return Mustache.to_html(template, ticket);

  };

  renders.ListTicket = function(ticket) {
    
    var template = '';
    
    return Mustache.to_html(template, ticket);

  };                   

  renders.newComment = function(comment) {

    var template = '';

    return Mustache.to_html(template, comment);

  };                   

  renders.DisplayComment = function(comment) {
    
    var template = '';

    return Mustache.to_html(template, comment);

  };

}).call(this);
