"use strict";


/**
 *  Routing Table
 *
 *  An object literal that gives minimum access
 *  requirements for each route
 *
 */

module.exports = {

  // Members and Admins can access all paths
  // except /users and /tickets/mine
  "get": {
    "/users": ["admin"],
    "/users/:userID": ["admin"],
    "/tickets": ["member", "admin"],
    "/tickets/mine": ["admin"],
    "/tickets/:ticketID": ["member", "admin"],
    "/tickets/:ticketID/comments": ["member", "admin"],
    "/tickets/:ticketID/comments/:commentID": ["member", "admin"]
  },

  // Only admins may create users
  "post": {
    "/users": ["admin"],
    "/tickets": ["member", "admin"],
    "/tickets/:ticketID/comments": ["member", "admin"]
  },

  // Limit updates to only the resource owner, except for
  // Users where an admin may need to make a change
  "put": {
    "/users/:userID": ["owner", "admin"],
    "/tickets/:ticketID": ["owner"],
    "/tickets/:ticketID/comments/:commentID": ["owner"]
  },

  // Only Admins or the resource owner may delete a resource
  "delete": {
    "/users/:userID": ["admin"],
    "/tickets/:ticketID": ["owner", "admin"],
    "/tickets/:ticketID/comments/:commentID": ["owner", "admin"]
  }
};