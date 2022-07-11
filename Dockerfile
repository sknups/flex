FROM node:16.13.1@sha256:534004248435dea5cecf3667232f800fc6bd101768306aecf6b87d78067b0563 as builder

WORKDIR /usr/src/app
COPY . .

RUN npm config set update-notifier false
RUN npm config set audit false
RUN npm config set fund false
RUN npm install
RUN npm test
RUN npm run build

FROM node:16.13.1-alpine3.14@sha256:8569c8f07454ec42501e5e40a680e49d3f9aabab91a6c149e309bac63a3c8d54

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
COPY --from=builder /usr/src/app/src/flex/views ./dist/flex/views

ENTRYPOINT ["node", "./dist/app.js" ]
