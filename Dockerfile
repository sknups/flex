# Build image and use another to serve the details (Multi Stage Docker)
# Best practice from: https://www.youtube.com/watch?v=wGz_cbtCiEA
FROM node:12 as builder

# Create app directory
WORKDIR /usr/src/app
COPY . .
# Install depencies
RUN npm install

# Build production project
RUN npm run build

## Now, as soon as we have the dist ready we build the final slim image
## Keep the same original image from builder but the slim one
FROM node:12-alpine

RUN apk add --update --no-cache \
        make \
        g++ \
        jpeg-dev \
        cairo-dev \
        giflib-dev \
        pango-dev

ENV NODE_ENV=production
ENV NO_COLOR=true
# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/static ./static
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/flex/views ./dist/flex/views

RUN npm install canvas

ENTRYPOINT ["node", "./dist/app.js" ]
