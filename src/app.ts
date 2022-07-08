const isProductionMode = process.env.NODE_ENV === 'production'
const isProfilerEnabled = process.env.PROFILER_ENABLED === 'true'

//Start GCP trace agent if running in production mode
if (isProductionMode) {
  require('@google-cloud/trace-agent').start({
    serviceContext: {
        service: 'flex-ui'
    }
  });
}

if (isProfilerEnabled) {
require('@google-cloud/profiler').start({
    serviceContext: {
      service: 'flex-ui'
    },
  });
}

const startTime = new Date().getTime();

import {CommonRoutesConfig} from './common/common.routes.config';
import debug from 'debug';
import {ServerUtils} from "./utils/server.utils";
import express from "express";
import http from "http";
import {ImagesRoutesConfig} from "./images/routes/images.routes.config";
import cors from "cors";
import { logger } from './logger'
import { FlexRoutesConfig } from "./flex/routes/flex.routes.config";
import path from 'path';
import cons from "consolidate";

// Load into ENV Variables from dotenv if not running
//in production mode
if (!isProductionMode) {
  require('dotenv').config();
}


const favicon = require('serve-favicon');



// Variables needed to start the server
// We set a new instance of app
// Tell the app if it will talk with GCP, and
// compress the response in case we are in prod mode
export const app: express.Application = ServerUtils.configureApp(
    express(),
    isProductionMode
);

app.engine('handlebars', cons.handlebars);
app.set('view engine', 'handlebars');
// view engine setup
app.set('views', [
    // Flex
    path.join(__dirname, './', 'flex', 'views')
]);


app.use(cors());
app.use(favicon(path.join(__dirname, '../static', 'favicon.ico')))

const server: http.Server = ServerUtils.createServer(app);
const port = ServerUtils.normalizePort(process.env.PORT || '3000');
const debugLog: debug.IDebugger = debug('flex-server-app');

const routes: Array<CommonRoutesConfig> = [
    // here we are adding the UserRoutes to our array,
    // after sending the Express.js application object to have the routes added to our app!
    new ImagesRoutesConfig(app),
    new FlexRoutesConfig(app)
];

// Return empty OK response, used check app is up when deployed
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('');
});

// Start server and listen on port
server.listen(port, () => {
    const taken = Intl.NumberFormat().format(new Date().getTime() - startTime);
    logger.info(`Server started in ${taken}ms, running on port ${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});

