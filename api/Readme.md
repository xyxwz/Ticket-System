# Ticket System API

Express API for the Ticket System.


## Authentication

Currently using [TxSSC-Passport](https://github.com/TxSSC/passport-txssc), but this will be changed to another generic [passport](https://github.com/jaredhanson/passport) strategy in the future.
The Ticket-System has a RESTful JSON api. It uses a token based authentication to sign request in the X-Auth-Token header.


## API Endpoints:

> All requests must include Content-Type, and X-Auth-Token headers.

All routes are RESTful, being if the endpoint is `/api/users` you can expect that there is an `/api/users/:id` route, and all other corresponding HTTP verb routes.

API status codes returned are the proper corresponding HTTP [status codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).

### Users

> Ticket system users

* *GET* `/api/users`

  * return all users

* *GET* `/api/users/:id`

  * return user with the specified `id`

* *POST* `/api/users`

  * create a new user

  * required parameters:

    * `username` - *String* - login name for the user

    * `name` - *String* - name of the user

    * `role` - *String* - permission level of user, *member* or *admin*

    * `avatar` - *String* - uri to the users avatar image

    * `access_token` - *String* - OAuth2 access token

    * `refresh_token` - *String* - OAuth2 refresh token

  * returns the newly created user

* *PUT* `/api/users/:id`

  * update the user with the corresponding `id`

  * accepts parameters:

    * `username` - *String* - login name of the user

    * `name` - *String* - name of the user

    * `role` - *String* - permission level of user, *member* or *admin*

  * returns the updated list

* *DELETE* `/api/users/:id`

  * destroys the user with the specified `id`

  * returns an error if present


### Tickets

> A workorder request, has many comments.

* *GET* `/api/tickets`

  * return all tickets

* *GET* `/api/tickets/mine`

  * uses `X-Auth-Token` for user

  * return all tickets belonging to, assigned to, or participating in for the user

* *GET* `/api/tickets/:id`

  * return ticket with specified `id`

* *POST* `/api/tickets`

  * create a new ticket object

  * required parameters:

    * `user` - *String* - ticket owner

    * `title` - *String* - ticket title

    * `description` - *String* - ticket body

  * returns the newly created ticket

* *PUT* `/api/tickets/:id`

  * update the ticket with new attributes

  * accepts parameters:

    * `title` - *String*

    * `description` - *String*

    * `status` - *String* - ticket status, *open* or *closed*

    * `assigned_to` - *Array* - user the ticket is assigned to

    * `participants` - *Array* - users that are participating in this ticket

  * returns the updated ticket


* *DELETE* `/api/tickets/:id`

  * destroys the ticket with specified `id`
  
  * returns an error if present


#### Comments

> Comments on a ticket object

* *GET* `/api/tickets/:ticketID/comments`

  * return all comments belonging to ticket with specified `ticketID`

* *GET* `/api/tickets/:ticketID/:id`

  * return comment with specified `id`

* *POST* `/api/tickets/:ticketID/comments`

  * create a new comment on ticket specified by `ticketID`

  * required parameters:

    * `user` - *String* - comment owner

    * `comment` - *String* - comment body

  * returns the newly created ticket

* *PUT* `/api/tickets/:ticketID/comments/:id`

  * update the comment specified by `:id` with new attributes

  * accepts parameters:

    * `comment` - *String*

  * returns the updated comment

* *DELETE* `/api/tickets/:ticketID/comments/:id`

  * destroys the comment with specified `id`
  
  * returns an error if present


### Lists

> User specific collection of tickets.

* *GET* `/api/lists`

  * returns all lists belonging to the current user

* *GET* `/api/lists/:id`

  * return list with the specified `id`

* *POST* `/api/lists`

  * create a new list

  * required parameters:

    * `name` - *String* - name of list

    * `user` - *String* - user that created this list

    * `color` - *String* - color the list will be in the web application

  * returns the newly created list

* *PUT* `/api/lists/:id`

  * update the list with the corresponding `id`

  * accepts parameters:

    * `name` - *String*

    * `tickets` - *Array* - array of ticket ids that belong to this list

  * returns the updated list

* *DELETE* `/api/lists/:id`

  * destroys the list with the specified `id`

  * returns an error if present


### Projects

> Global collection of tickets - not used by the current version of the web application.

* *GET* `/api/projects`

  * returns all projects

* *GET* `/api/projects/:id`

  * return project with the specified `id`

* *POST* `/api/projects`

  * create a new project

  * required parameters:

    * `name` - *String* - name of project

    * `user` - *String* - user that created this project

    * `description` - *String* - brief description of project

  * returns the newly created project

* *PUT* `/api/projects/:id`

  * update the project with the corresponding `id`

  * accepts parameters:

    * `name` - *String*

    * `description` - *String*

    * `tickets` - *Array* - array of ticket ids that belong to this project

  * returns the updated project

* *DELETE* `/api/projects/:id`

  * destroys the project with the specified `id`

  * returns an error if present


## Example Requests

##### Return all users:

```shell
curl -H 'X-Auth-Token: APITOKENHERE' -H 'Content-Type: application/json' -X GET localhost:3000/api/users
```


## License

Copyright (c) 2011-2013 TXSSC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.