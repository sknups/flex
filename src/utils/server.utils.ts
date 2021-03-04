import * as http from "http";
import * as express from "express";
import bodyparser from "body-parser";
import cors from "cors";
import * as Transport from "winston-transport";
import winston from "winston";
import {LoggingWinston} from "@google-cloud/logging-winston";
import expressWinston from "express-winston";
import cookieParser from "cookie-parser";
import * as path from 'path';

export class ServerUtils {

    /**
     * Normalize a port into a number, string, or false.
     * @return number | string | boolean
     */
    static normalizePort(withValue: string): number | string {
        const port = parseInt(withValue, 10);

        if (isNaN(port)) {
            // named pipe
            return withValue;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return 0;
    }

    /**
     * Create a server from a given express application
     * @param fromApp
     */
    static createServer(fromApp: express.Application): http.Server {
        return http.createServer(fromApp);
    }

    /**
     * Get the app configured a ready to be served
     * @param fromApp the express app
     * @param withGCPLogs boolean
     */
    static configureApp(fromApp: express.Application, withGCPLogs = false): express.Application {
        const transports: Transport[] = [
            new winston.transports.Console()
        ];

        // view engine setup
        fromApp.set('views', [path.join(__dirname, '../', '/views')]);
        fromApp.set('view engine', 'pug');

        // here we are adding middleware to parse all incoming requests as JSON
        fromApp.use(bodyparser.json());
        fromApp.use(express.urlencoded({ extended: false }));
        fromApp.use(cookieParser());

        // here we are adding middleware to allow cross-origin requests
        fromApp.use(cors());

        // In case we want to use GCP Logs
        if (withGCPLogs) {
            transports.push(new LoggingWinston())
        }

        // here we are configuring the expressWinston error-logging middleware,
        // which doesn't *handle* errors per se, but does *log* them
        fromApp.use(expressWinston.errorLogger({
            transports,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.json()
            )
        }));

        return fromApp;
    }
}
