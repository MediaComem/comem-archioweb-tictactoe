# Contributing

This is the teacher guide to contribute to this project. To do the exercise,
read the [README.md](README.md).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Requirements](#requirements)
- [Usage](#usage)
  - [Initial setup](#initial-setup)
  - [Run in development mode](#run-in-development-mode)
  - [Run in production mode](#run-in-production-mode)
  - [Run with Docker](#run-with-docker)
  - [Set up a WAMP router on a cloud server](#set-up-a-wamp-router-on-a-cloud-server)
- [Branches](#branches)
  - [`master`](#master)
  - [`ws-solution`](#ws-solution)
  - [`wamp-solution`](#wamp-solution)
- [Configuration](#configuration)
- [Resources](#resources)
- [TODO](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Requirements

* [Node.js][node] 12.x



## Usage

### Initial setup

Clone the repository and install dependencies:

```bash
$> git clone git@github.com:MediaComem/comem-archioweb-tic-tac-toe.git
$> cd comem-archioweb-tic-tac-toe
$> npm ci
```

### Run in development mode

```bash
$> npm run start:watch
```

### Run in production mode

Build the frontend component first:

```bash
$> npm run frontend:build
```

Then start the application:

```bash
$> npm start
```
Visit [http://localhost:3000](http://localhost:3000).

### Run with Docker

```bash
$> npm run docker:build
$> docker run comem-archioweb-tic-tac-toe -p 3000:3000
```

Visit [http://localhost:3000](http://localhost:3000).

### Set up a WAMP router on a cloud server

You may set up a WAMP router on a cloud server with [Ansible][ansible] if you
know how to use it.

Copy the `inventory.sample.yml` file to `inventory.yml` and adapt it for your
cloud server:

```bash
$> cp inventory.sample.yml inventory.yml
```

Run the playbook at the root of this repository:

```bash
$> ansible-playbook -vv -D -i inventory.yml playbook.yml
```



## Branches

### `master`

The `master` branch contains the unimplemented version of the application, with
the `app/backend/dispatcher.js` and `app/frontend/dispatcher.js` missing code.
You can run it, but the game list will always show empty and no controls will
work.

Commit all changes to application or game logic (i.e. anything that's not the 2
dispatcher files) or exercise instructions to this branch.

**WARNING: every time you make changes to this branch, merge it to both the
`ws-solution` and `wamp-solution` branches to keep them up to date.**

### `ws-solution`

The `ws-solution` branch contains a working version of the application using
[WebSockets][ws] to communicate between the backend and frontend.

### `wamp-solution`

The `wamp-solution` branch contains a working version of the application using
the [Web Application Messaging Protocol (WAMP)][wamp] to communicate between the
backend and frontend.

This version requires a running WAMP router, for example
[Crossbar.io][crossbar]. You can [start one with Docker][crossbar-docker]. It
must be deployed somewhere both the backend and frontend clients can reach it.



## Configuration

This project uses [dotenv][dotenv], so you can also provide these environment
variables by creating a `.env` file in this repository (it will be ignored). An
example is provided in the `.env.sample` file.

Environment variable(s)      | Default value                  | Description
:--------------------------- | :----------------------------- | :---------------------------------------------------------------------------------------------------
`$TICTACTOE_LOG_LEVEL`       | `DEBUG`                        | The application's log level. Possible values are `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.
`$TICTACTOE_NAMESPACE`       | `ch.comem.archioweb.tictactoe` | Namespace to be used to avoid name collisions.
`$TICTACTOE_PORT` or `$PORT` | `3000`                         | The port on which the backend server will listen to.
`$TICTACTOE_SECRET`          | *(none)*                       | Secret to be used for authentication.



## Resources

* https://webpack.js.org
* https://www.npmjs.com/package/ws
* https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications



## TODO

* Add schema
* Make a more beautiful interface
* Add browser auto-refresh for development
* Fix memory leaks (games accumulate in the game manager)
* Improve ID generation
* Show who is currently playing



[ansible]: https://www.ansible.com
[crossbar]: https://crossbar.io
[crossbar-docker]: https://crossbar.io/docs/Getting-Started/#starting-a-crossbar-io-router
[dotenv]: https://www.npmjs.com/package/dotenv
[node]: https://nodejs.org
[wamp]: https://wamp-proto.org
[ws]: https://en.wikipedia.org/wiki/WebSocket