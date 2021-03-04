# Flex Server

**Will evolve during time. This might not be the end result**

## Intro

Project based on FLEX PoC from [GitHub Branch DEV-20](https://github.com/SknUps/flex_poc).


## Brief explanation

The idea behind the project structure’s two folders (common and flex) is to have individual modules that have their own responsibilities.
In this sense, we are eventually going to have some or all of the following for each module:

- **Route** configuration to define the requests our API can handle;
- **Services** for tasks such as connecting to external services that are required by the specific request;
- **Middleware** for running specific request validations before the final controller of a route handles its specifics;
- **Models** for defining data models matching a given database schema, to facilitate data storage and retrieval;
- **Controller** for separating the route configuration from the code that finally (after any middleware) processes a route request, calls the above service functions if necessary, and gives a response to the client
- **Views** for handling the templates for each UI

## How to start

It's a common Node app, so, before start, make sure you install all dependencies `npm install`

### Development

To start in development mode just run: `npm run dev`

### Build

To build run the command `npm run build`

## Docker

There is a `Dockerfile` that will handle the build and Dockerize the Express app to be deployed.

The default port is `3000` but we can set another one using the ENV variables

## Env Configs Available

We can mount a `.env` file alongside the `app.js` file. This can be done when building (please extend the `Dockerfile`) or by [mounting a Volume](https://docs.docker.com/storage/bind-mounts/).

```bash
# The default port. We don't need to set one to be 3000
PORT=3000

# The ability to communicate with GCP logs. Disabled by default
GCP_LOG=0

# Link to be used to communicate with DRM server
DRM_SERVER=
```



