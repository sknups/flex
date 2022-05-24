FROM node:16.13.1@sha256:534004248435dea5cecf3667232f800fc6bd101768306aecf6b87d78067b0563 as builder

WORKDIR /usr/src/app
COPY . .

RUN npm install &&\
    npm run build

FROM node:16.13.1-alpine3.14@sha256:8569c8f07454ec42501e5e40a680e49d3f9aabab91a6c149e309bac63a3c8d54

RUN apk add --no-cache --virtual .build-deps \
        build-base=0.5-r2 \ 
        g++=10.3.1_git20210424-r2 &&\
        apk add --no-cache \
        libpng=1.6.37-r1 \
        libpng-dev=1.6.37-r1 \
        jpeg-dev=9d-r1 \
        libjpeg-turbo-dev=2.1.0-r0 \
        cairo-dev=1.16.0-r5 \
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
