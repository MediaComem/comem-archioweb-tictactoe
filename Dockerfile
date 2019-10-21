FROM node:alpine

LABEL name="tic-tac-toe-websocket"
LABEL version="0.1"
LABEL description="A container for a Tic-Tac-Toe in websocket"

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . /usr/src/app

RUN npm install


ENV SERVER_PORT 8080
ENV WEBSOCKET_PORT 8081
EXPOSE $SERVER_PORT
EXPOSE $WEBSOCKET_PORT

CMD [ "npm", "start" ]
