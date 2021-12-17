FROM node:14.18.2@sha256:8e0a8ee16dcc4775aad34142aae2cd8183fba12e1ff2fccb1011b9942e3c1cb6 as builder

ENV CLOUDSDK_PYTHON=/usr/bin/python3

WORKDIR /usr/src/app
COPY . .

RUN npm install &&\
    npm run build

FROM node:14.18.2-alpine3.14@sha256:4bcf68e202e0b5abc21c674a73c55c87fcae17bcfb7ffa552ef8220114481124

ENV CLOUDSDK_PYTHON=/usr/bin/python3

RUN apk add --no-cache --virtual .build-deps \
        build-base=0.5-r2 \ 
        g++=10.3.1_git20210424-r2 &&\
     apk add --no-cache \
        libpng=1.6.37-r1 \
        libpng-dev=1.6.37-r1 \
        jpeg-dev=9d-r1 \
        libjpeg-turbo-dev=2.1.0-r0 \
        cairo-dev=1.16.0-r3 \
        giflib-dev=5.2.1-r0 \
        pango-dev=1.48.5-r0

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
