# archioweb-websockets-exercise

## Requirements
- Node.js 12.x

## Usage
```
git clone git@gitlab.com:mediacomem/comem/archioweb-websockets-exercise.git
cd archioweb-websockets-exercise
npm ci
npm start
```

Visit localhost:8080, Websocket API is running on localhost:8081

## Developing the app

The 'app' folder contains all the javascript for the app.
The 'app/backend' folder contains all backend source related.
The 'app/frontend' folder contains all frontend source related.
The 'app/class' folder contains all common class between the frontend and the backend.

### General operating diagram of the application
--> TODO

### Developing the backend

```
npm run back-watch
```

### Developing the frontend

```
npm run front-watch
```

### Create the frontend distrib
```
npm run front-build
```

## Deploy the app

### Via docker
```
npm run docker-build
docker run tic-tac-toe-websocket -p 8080:80 -p 8081:8081
```


## Resources
- https://webpack.js.org/
- https://www.npmjs.com/package/ws
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

## Todo
- Add documentation
- Add some comments
- Add Schema
- Make a more beautiful interface