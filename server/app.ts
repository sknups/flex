import {CommonRoutesConfig} from './common/common.routes.config';
import {CertificatesRoutesConfig} from './certificates/routes/certificates.routes.config';
import debug from 'debug';
import {ServerUtils} from "./utils/server.utils";
import express from "express";
import http from "http";
import bodyparser from "body-parser";
import cors from "cors";
import winston from "winston";
import expressWinston from "express-winston";

// Variables needed to start the server
const app: express.Application = express();
const server: http.Server = ServerUtils.createServer(app);
const port = ServerUtils.normalizePort(process.env.PORT || '3000');

const routes: Array<CommonRoutesConfig> = [
    // here we are adding the UserRoutes to our array,
    // after sending the Express.js application object to have the routes added to our app!
    new CertificatesRoutesConfig(app)
];
const debugLog: debug.IDebugger = debug('flex-server-app');

// here we are adding middleware to parse all incoming requests as JSON
app.use(bodyparser.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// here we are configuring the expressWinston logging middleware,
// which will automatically log all HTTP requests handled by Express.js
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

// here we are configuring the expressWinston error-logging middleware,
// which doesn't *handle* errors per se, but does *log* them
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

// this is a simple route to make sure everything is working properly
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server up and running!`)
});

server.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});
