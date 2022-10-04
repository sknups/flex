import * as http from "http";
import * as express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import {StatusCodes} from "http-status-codes";
import {expressWinstonMiddleware } from '../logger'

export class ServerUtils {

    static tracer: any = null;

    static getTracer(): any {
        return ServerUtils.tracer;
    }

    static setTracer(tracer: any) {
        ServerUtils.tracer = tracer;
    }

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
     * @param fromApp     
     * @param toProd
     */
    static configureApp(fromApp: express.Application, toProd = false): express.Application {        
      

        // here we are adding middleware to allow cross-origin requests
        fromApp.use(cors());

        // Good practice mentioned in https://expressjs.com/en/advanced/best-practice-security.html
        fromApp.use(helmet({
            // Or I won't be able to load the socializer plugin
            contentSecurityPolicy: false,
        }));
        fromApp.disable('x-powered-by');
        
        fromApp.use('/static', express.static('static'));        
     
        if (toProd) {
            fromApp.use(compression());            
        }

        fromApp.use(expressWinstonMiddleware);
        
        //@ts-ignore
        fromApp.use(function (err, req, res, next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            switch (err.statusCode) {
                case StatusCodes.NOT_FOUND:
                    res.status(StatusCodes.NOT_FOUND);
                    res.render('404');
                    break;
                default:
                    res.status(err.status || 500);
                    res.render('500');
            }
        });

        return fromApp;
    }
}
