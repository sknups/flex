FROM node:18.16.0 as builder

WORKDIR /usr/src/app
COPY . .

RUN npm config set update-notifier false
RUN npm config set audit false
RUN npm config set fund false
RUN npm install
RUN npm test
RUN npm run build

FROM node:18.16.0-alpine3.17

RUN apk add --no-cache --virtual .build-deps \
        build-base \
        g++ &&\
        apk add --no-cache \
        libpng \
        libpng-dev \
        jpeg-dev \
        libjpeg-turbo-dev \
        cairo-dev \
        giflib-dev \
        pango-dev

ENV NODE_ENV=production
ENV NO_COLOR=true

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production &&\
    apk del .build-deps

COPY --from=builder /usr/src/app/static ./static
COPY --from=builder /usr/src/app/dist ./dist

ENTRYPOINT ["node", "./dist/app.js" ]
