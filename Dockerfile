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
FROM node:12.21.0-alpine3.12

# Create app directory
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist .
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENTRYPOINT ["node", "./app.js" ]
