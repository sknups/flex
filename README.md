# Flex Server

## Intro

Image server which generates cards for items and skus, and also serves non-static images for hte app - eg, SKU images and models, non-default backgrounds, videos

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

Nodejs should **never** be installed directly, that creates a versioning nightmare.

Instead, install Node Version Manager (nvm):

https://github.com/nvm-sh/nvm#installing-and-updating

Use nvm to install the supported Nodejs version:

```shell
nvm install 16.13.1
nvm alias default 16.13.1
```

Confirm the correct Nodejs version is installed:

```shell
% node -v
v16.13.1
```

Configure npm:

```shell
npm config set update-notifier false
npm config set audit false
npm config set fund false
```

If your architecture is Apple Silicon, e.g. MacBook Air M1, you will need build dependencies for npm package `canvas` to exist:

```shell
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

Install npm dependencies:

```shell
npm install
```

### Development

If you want to execute flex locally, but have it interact with drm-service in development environment (recommended):

```shell
ENVIRONMENT="dev" GOOGLE_AUTH_TOKEN=$(gcloud auth print-identity-token) npm run dev2
```

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

# HTTP endpoint for get SKU cloud function
GET_SKU_CLOUD_FUNCTION=

#Optional: set the Goggle Analytics Id.
#if not set Goggle Analytics is not loaded 
GA_MEASUREMENT_ID=

#Optional: set the Legacy Goggle Analytics Id, 
#
#If not set data is not sent to the legacy Goggle Analytics property.
#This requires GA_MEASUREMENT_ID to be set
#This data is used by Optimize
GA_LEGACY_MEASUREMENT_ID=

#Optional: set the Goggle Optimize Id, 
#
#If not set Goggle Optimize is not loaded 
OPTIMIZE_ID=

#Optional: defaults to 'http://localhost:4200'
SKNAPP_HOST=
```

Example on how to start a docker image with env variables from the command line or defining a file:

```bash
# We can use the -e, --env and set to = something or use a .env file (I recommend this one)
# More info here https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file
docker run -e MYVAR1 --env MYVAR2=foo --env-file ./env.list IMAGE_NAME:VERSION
```


### Start Docker image against GCP services
This requires default application credentials to be configured.
See: https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login

This will create a json file for auth, ie: `~/.config/gcloud/application_default_credentials.json`.

Now run:
```bash
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
GOOGLE_AUTH_TOKEN="$(gcloud auth print-identity-token)" \
  docker-compose --env-file docker-compose-gcp.env up  --build
```
