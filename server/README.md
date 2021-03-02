# Flex Server

**It will be moved to a separate git must probably**

## Intro

Project based on FLEX PoC from [GitHub Branch DEV-20](https://github.com/SknUps/flex_poc).


## Brief explanation

The idea behind the project structure’s two folders (common and flex) is to have individual modules that have their own responsibilities.
In this sense, we are eventually going to have some or all of the following for each module:

- **Route** configuration to define the requests our API can handle;
- **Services** for tasks such as connecting to external services that are required by the specific request;
- **Middleware** for running specific request validations before the final controller of a route handles its specifics;
- **Models** for defining data models matching a given database schema, to facilitate data storage and retrieval;
- **Controllers** for separating the route configuration from the code that finally (after any middleware) processes a route request, calls the above service functions if necessary, and gives a response to the client

## How to start

TBD

## How to deploy

TBD
