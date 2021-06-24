import winston from "winston";
import * as Transport from "winston-transport";
import {LoggingWinston} from "@google-cloud/logging-winston";
import expressWinston from "express-winston";

const transports: Transport[] = [
    new winston.transports.Console()
];

if (process.env.NODE_ENV === 'production') {
  transports.push(new LoggingWinston());
}

export const logger = winston.createLogger({
    level: 'info',
    transports: transports,
});


export const expressWinstonMiddleware = expressWinston.logger({
    transports: transports,
    format: winston.format.combine(                
        winston.format.json()
    )
})




