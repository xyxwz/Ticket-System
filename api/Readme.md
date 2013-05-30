# Ticket System API

Express API for the Ticket System.


## Authentication

Currently using [TxSSC-Passport](https://github.com/TxSSC/passport-txssc), but this will be changed to another generic [passport](https://github.com/jaredhanson/passport) strategy in the future.
The Ticket-System has a RESTful JSON api. It uses a token based authentication to sign request in the X-Auth-Token header.


## API Endpoints:

> All requests must include a Content-Type, and X-Auth-Token headers.

All routes are RESTful, being if the endpoint is `/api/users` you can expect that there is an `/api/users/:id` route, and all other corresponding HTTP verb routes.

### Users


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

* *PUT* `/api/tickets/:id`

* *DELETE* `/api/tickets/:id`


#### Comments

> Comments on a ticket object

### Lists

> User specific listing of tickets.

### Projects

> Global collection of tickets - currently not used by the current version of the web application.

* *GET* `/api/projects`

  * returns all projects

* *GET* `/api/projects/:id`

  * return project with the specified `id`

* *POST* `/api/projects`

  * create a new project

  * expects the body to contain a `project` object

* *PUT* `/api/projects/:id`

  * update the project with the corresponding `id`

  *

* *DELETE* `/api/projects/:id`

  * delete project with the specified `id`


## Example Requests

##### Return all users:

```shell
curl -H 'X-Auth-Token: APITOKENHERE' -H 'Content-Type: application/json' -X GET localhost:3000/api/users
```