# Web-Oriented Architecture Tic-Tac-Toe Exercise

This is an exercise for the [COMEM+ Web-Oriented Architecture Course][course].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Exercise](#exercise)
  - [Requirements](#requirements)
  - [The goal](#the-goal)
  - [Getting started](#getting-started)
  - [Implement real-time communications](#implement-real-time-communications)
- [Contributing](#contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

The exercise assumes you are familiar with the following subjects of the course:

* [WebSockets][ws-subject]
* [Web Application Messaging Protocol (WAMP)][wamp-subject]



## Exercise

### Requirements

* [Node.js][node] 12.x

### The goal

The purpose of this exercise is to implement real-time communication in a small
web game, either with [WebSockets][ws] or the [Web Application Messaging
Protocol (WAMP)][wamp].

This repository contains a partially implemented [tic-tac-toe][tictactoe] web
application:

* The `app/backend` directory contains an [Express.js][express] application that
  can register players and manage multiple games.
* The `app/frontend` directory contains a [jQuery][jquery] application that can
  display a list of available tic-tac-toe games, as well as the game interface.
* The `app/class` directory contains domain classes used by both previous
  components.

The game logic is fully implemented, but **there is no communication between
backend and frontend**. The code has been structured so that there are only 2
files that need to be modified to make the application functional:

* The `app/backend/dispatcher.js` file handles the backend's communications with
  the frontend clients.
* The `app/frontend/dispatcher.js` file handles the frontend client's
  communications with the backend.

Use one of the two suggested technologies to make the game functional.

### Getting started

Clone this repository:

```bash
$> git clone https://github.com/MediaComem/comem-archioweb-tic-tac-toe
```

Move into the repository and install dependencies:

```bash
$> cd comem-archioweb-tic-tac-toe
$> npm ci
```

Run the following command to launch both the backend and frontend in development
mode (code will re-compile automatically when you change files, although **you
will still have to refresh your browser window**):

```bash
$> npm run start:watch
```

### Implement real-time communications

Follow one of these guides:

* [Implement communications with WebSockets](WS.md)
* [Implement communication with the Web Application Messaging Protocol (WAMP)](WAMP.md)



## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).



[course]: https://github.com/MediaComem/comem-archioweb
[express]: https://expressjs.com
[jquery]: https://jquery.com
[node]: https://nodejs.org
[tictactoe]: https://en.wikipedia.org/wiki/Tic-tac-toe
[wamp]: https://wamp-proto.org
[wamp-subject]: https://mediacomem.github.io/comem-archioweb/2019-2020/subjects/wamp/?home=MediaComem%2Fcomem-archioweb%23readme#1
[ws]: https://en.wikipedia.org/wiki/WebSocket
[ws-subject]: https://mediacomem.github.io/comem-archioweb/2019-2020/subjects/ws/?home=MediaComem%2Fcomem-archioweb%23readme#1