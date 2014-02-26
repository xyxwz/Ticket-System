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
    "/users": ["admin", "member", "read"],
    "/users/:userID": ["admin", "read", "owner"],
    "/projects": ["member", "admin", "read"],
    "/projects/:projectID": ["member", "admin", "read"],
    "/lists": ["admin", "member"],
    "/lists/:listID": ["owner"],
    "/tickets": ["member", "admin", "read"],
    "/tickets/mine": ["admin", "member"],
    "/tickets/:ticketID": ["member", "admin", "read"],
    "/tickets/:ticketID/comments": ["member", "admin", "read"],
    "/tickets/:ticketID/comments/:commentID": ["member", "admin", "read"],
    "/notifications": ["member", "admin", "read"],
    "/unread": ["member", "admin", "read"]
  },

  // Only admins may create users
  "post": {
    "/users": ["admin"],
    "/projects": ["admin", "member"],
    "/lists": ["admin", "member"],
    "/tickets": ["admin", "member"],
    "/tickets/:ticketID/comments": ["admin", "member"]
  },

  // Limit updates to only the resource owner, except for
  // Users where an admin may need to make a change
  "put": {
    "/users/:userID": ["owner", "admin"],
    "/projects/:projectID": ["admin", "owner"],
    "/lists/:listID": ["owner"],
    "/tickets/:ticketID": ["owner", "admin", "member"],
    "/tickets/:ticketID/comments/:commentID": ["owner"]
  },

  // Only Admins or the resource owner may delete a resource
  "delete": {
    "/users/:userID": ["admin"],
    "/projects/:projectID": ["owner", "admin"],
    "/lists/:listID": ["owner"],
    "/tickets/:ticketID": ["owner", "admin"],
    "/tickets/:ticketID/comments/:commentID": ["owner", "admin"],
    "/notifications/:notificationID": ["member", "admin", "read"]
  }
};