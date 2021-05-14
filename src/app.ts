import dotenv from "dotenv";
import {CommonRoutesConfig} from './common/common.routes.config';
import {CertificatesRoutesConfig} from './certificates/routes/certificates.routes.config';
import debug from 'debug';
import {ServerUtils} from "./utils/server.utils";
import express from "express";
import http from "http";
import {ImagesRoutesConfig} from "./images/routes/images.routes.config";
import cors from "cors";

// Load into ENV Variables
dotenv.config();


const opentelemetry = require('@opentelemetry/api');
const {NodeTracerProvider} = require('@opentelemetry/node');
const {SimpleSpanProcessor} = require('@opentelemetry/tracing');
const {TraceExporter} = require('@google-cloud/opentelemetry-cloud-trace-exporter');

// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.
const provider = new NodeTracerProvider();

// Initialize the exporter. When your application is running on Google Cloud,
// you don't need to provide auth credentials or a project id.
const exporter = new TraceExporter();

// Configure the span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));


// Variables needed to start the server
// We set a new instance of app
// Tell the app if it will talk with GCP, and
// compress the response in case we are in prod mode
export const app: express.Application = ServerUtils.configureApp(
    express(),
    true, true
    // parseInt(process.env?.GCP_LOG || '') === 1 || false,
    // process.env.NODE_ENV === 'production'
);

app.use(cors());

const server: http.Server = ServerUtils.createServer(app);
const port = ServerUtils.normalizePort(process.env.PORT || '3000');
const debugLog: debug.IDebugger = debug('flex-server-app');

const routes: Array<CommonRoutesConfig> = [
    // here we are adding the UserRoutes to our array,
    // after sending the Express.js application object to have the routes added to our app!
    new CertificatesRoutesConfig(app),
    new ImagesRoutesConfig(app)
];

// this is a simple route to make sure everything is working properly
// Adding just a default rout
app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index', { title: 'SKNUPS', certificateHostPath: CertificatesRoutesConfig.ROUTE_NEEDLE})
});

app.use("/socket.io", express.static('../socket.io'));
let io = require("socket.io")(server);
io.listen(server);

// Start server and listen on port
server.listen(port, () => {
    debugLog(`Server running at ${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});

