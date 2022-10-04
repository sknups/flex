import winston from "winston";
import * as Transport from "winston-transport";
import {LoggingWinston} from "@google-cloud/logging-winston";
import expressWinston from "express-winston";
import {ServerUtils} from '../utils/server.utils';

const transports: Transport[] = [
    new winston.transports.Console()
];

if (process.env.NODE_ENV === 'production') {
    transports.push(new LoggingWinston());
}

const gcpProject = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;

const gcpLogFormat = winston.format(info => {
    if (info.level && !info.severity) {
        info.severity = info.level.toUpperCase();
    }
    const traceContext = ServerUtils.getTracer()?.getCurrentRootSpan()?.getTraceContext();
    if (gcpProject && traceContext) {
        info['logging.googleapis.com/trace'] = `projects/${gcpProject}/traces/${traceContext.traceId}`;
    }
    return info;
});

const format = winston.format.combine(
    gcpLogFormat(),
    winston.format.timestamp(),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: 'info',
    transports: transports,
    format: format
});


export const expressWinstonMiddleware = expressWinston.logger({
    transports: transports,
    format: format
})




