import * as http from "http";
import * as express from "express";
import bodyparser from "body-parser";
import cors from "cors";
import * as Transport from "winston-transport";
import winston from "winston";
import {LoggingWinston} from "@google-cloud/logging-winston";
import expressWinston from "express-winston";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from 'path';
import compression from "compression";
import createError from 'http-errors';

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
    static configureApp(fromApp: express.Application, withGCPLogs = false, toProd = false): express.Application {
        const transports: Transport[] = [
            new winston.transports.Console()
        ];

        // Good practice mentioned in https://expressjs.com/en/advanced/best-practice-security.html
        fromApp.use(helmet());
        fromApp.disable('x-powered-by');

        // view engine setup
        fromApp.set('views', [
            // Common
            path.join(__dirname, '../', '/views'),

            // Certificates
            path.join(__dirname, '../', 'certificates', 'views'),

            // Images
            path.join(__dirname, '../', 'images', 'views')
        ]);
        fromApp.use(express.static(path.join(__dirname, '../../', 'public')));
        fromApp.use('/static', express.static('static'));
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

        if(toProd) {
            fromApp.use(compression())
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

        /*
        // Error handling
        // catch 404 and forward to error handler
        fromApp.use( (req, res, next) => {
            next(createError(404));
        });

        // error handler
        // Seems that TS doesn't understand this info. Its documented in expressjs
        // https://expressjs.com/en/guide/error-handling.html
        // @ts-ignore
        fromApp.use( (err, req, res, next) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
         */
        return fromApp;
    }
}
