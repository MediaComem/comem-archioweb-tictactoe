FROM node:12.13.0-alpine

LABEL name="tic-tac-toe-websocket" \
      version="0.1" \
      description="A container for a Tic-Tac-Toe in websocket"

WORKDIR /usr/src/app

ENV SERVER_PORT=8080 \
    WEBSOCKET_PORT=8081

COPY package.json package-lock.json /usr/src/app/

RUN apk --no-cache add \
      make \
      python \
    && \
    npm install

COPY . /usr/src/app/

RUN npm run lint && \
    npm run front-build

EXPOSE $SERVER_PORT $WEBSOCKET_PORT

CMD [ "npm", "start" ]