FROM node:12.13.0-alpine

LABEL name="comem-archioweb-tic-tac-toe" \
      version="1.0.0" \
      description="A container for a real-time Tic-Tac-Toe application"

WORKDIR /usr/src/app

ENV PORT=3000

COPY package.json package-lock.json /usr/src/app/

RUN apk --no-cache add \
      make \
      python \
    && \
    npm ci

COPY . /usr/src/app/

RUN npm run lint && \
    npm run frontend:build

EXPOSE $PORT

CMD [ "npm", "start" ]